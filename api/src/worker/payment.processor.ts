import { Processor, Process } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Processor('payment-events')
export class PaymentProcessor {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('rollup') private readonly rollupQueue: Queue,
  ) {}

  @Process('process')
  async handlePaymentEvent(job: Job<any>) {
    const rawData = job.data;
    this.logger.log(`Processing payment event: job ID ${job.id}`);

    const provider = rawData.provider || 'razorpay';
    const eventType = rawData.event || rawData.payload?.event || '';
    const payload = rawData.payload || rawData;
    const eventId = rawData.eventId || rawData.id;

    // Resolve tenant
    let tenantId = rawData.tenantId;
    if (!tenantId) {
      const firstTenant = await this.prisma.tenant.findFirst();
      if (!firstTenant) {
        this.logger.error('No tenant found in database for payment event');
        return;
      }
      tenantId = firstTenant.id;
    }

    const affectedDates = new Set<string>();
    const now = new Date();

    const plEntity = payload.payment_link?.entity;
    const payEntity = payload.payment?.entity;

    const plinkRef = plEntity?.id;
    const shortUrl = plEntity?.short_url;

    // Helper to find matching PaymentLink by ID or short URL
    const findMatchingPaymentLink = async () => {
      if (!plinkRef && !shortUrl) return null;
      const conditions: any[] = [];
      if (plinkRef) conditions.push({ providerRef: plinkRef });
      if (shortUrl) {
        conditions.push({ providerRef: shortUrl });
        conditions.push({ providerRef: shortUrl.replace(/^https?:\/\//, '') });
        conditions.push({ providerRef: `https://${shortUrl.replace(/^https?:\/\//, '')}` });
      }
      return this.prisma.paymentLink.findFirst({
        where: {
          tenantId,
          OR: conditions,
        },
      });
    };

    if (eventType === 'payment_link.created') {
      // 1. payment_link.created: upsert PaymentLink with status=CREATED
      if (plinkRef) {
        await this.prisma.paymentLink.upsert({
          where: { providerRef: plinkRef },
          create: {
            tenantId,
            providerRef: plinkRef,
            provider,
            amount: plEntity.amount ? Number(plEntity.amount) : 0,
            currency: plEntity.currency || 'INR',
            status: 'CREATED',
            expiresAt: plEntity.expire_by ? new Date(plEntity.expire_by * 1000) : undefined,
          },
          update: {
            amount: plEntity.amount ? Number(plEntity.amount) : undefined,
            currency: plEntity.currency || undefined,
            status: 'CREATED',
            expiresAt: plEntity.expire_by ? new Date(plEntity.expire_by * 1000) : undefined,
          },
        });
      }
      affectedDates.add(now.toISOString().slice(0, 10));
    } else if (eventType === 'payment_link.paid' || eventType === 'payment.captured') {
      // 2. payment_link.paid or payment.captured: upsert Payment, update PaymentLink status=PAID, set paidAt
      let matchedLink = await findMatchingPaymentLink();

      const paidAt = payEntity?.created_at
        ? new Date(Number(payEntity.created_at) * 1000)
        : now;
      affectedDates.add(paidAt.toISOString().slice(0, 10));

      if (matchedLink) {
        matchedLink = await this.prisma.paymentLink.update({
          where: { id: matchedLink.id },
          data: {
            status: 'PAID',
            paidAt,
            amount: plEntity?.amount ? Number(plEntity.amount) : matchedLink.amount,
          },
        });
      } else if (plinkRef) {
        matchedLink = await this.prisma.paymentLink.create({
          data: {
            tenantId,
            providerRef: plinkRef,
            provider,
            amount: plEntity?.amount ? Number(plEntity.amount) : (payEntity?.amount ? Number(payEntity.amount) : 0),
            currency: plEntity?.currency || payEntity?.currency || 'INR',
            status: 'PAID',
            paidAt,
          },
        });
      }

      // Upsert Payment record
      const payRef = payEntity?.id || (plinkRef ? `pay_${plinkRef}` : `pay_${Date.now()}`);
      const paymentAmount = payEntity?.amount
        ? Number(payEntity.amount)
        : (plEntity?.amount ? Number(plEntity.amount) : 0);
      const paymentCurrency = payEntity?.currency || plEntity?.currency || 'INR';

      await this.prisma.payment.upsert({
        where: { providerRef: payRef },
        create: {
          tenantId,
          providerRef: payRef,
          paymentLinkId: matchedLink?.id,
          amount: paymentAmount,
          currency: paymentCurrency,
          status: payEntity?.status || 'captured',
          paidAt,
          rawPayload: payload,
        },
        update: {
          paymentLinkId: matchedLink?.id || undefined,
          amount: paymentAmount,
          currency: paymentCurrency,
          status: payEntity?.status || 'captured',
          paidAt,
          rawPayload: payload,
        },
      });
    } else if (eventType === 'payment_link.expired') {
      // 3. payment_link.expired: update PaymentLink status=EXPIRED
      const matchedLink = await findMatchingPaymentLink();
      if (matchedLink) {
        await this.prisma.paymentLink.update({
          where: { id: matchedLink.id },
          data: { status: 'EXPIRED' },
        });
      } else if (plinkRef) {
        await this.prisma.paymentLink.upsert({
          where: { providerRef: plinkRef },
          create: {
            tenantId,
            providerRef: plinkRef,
            provider,
            amount: plEntity?.amount ? Number(plEntity.amount) : 0,
            currency: plEntity?.currency || 'INR',
            status: 'EXPIRED',
          },
          update: { status: 'EXPIRED' },
        });
      }
      affectedDates.add(now.toISOString().slice(0, 10));
    } else if (eventType === 'payment_link.cancelled') {
      // 4. payment_link.cancelled: update PaymentLink status=CANCELLED
      const matchedLink = await findMatchingPaymentLink();
      if (matchedLink) {
        await this.prisma.paymentLink.update({
          where: { id: matchedLink.id },
          data: { status: 'CANCELLED' },
        });
      } else if (plinkRef) {
        await this.prisma.paymentLink.upsert({
          where: { providerRef: plinkRef },
          create: {
            tenantId,
            providerRef: plinkRef,
            provider,
            amount: plEntity?.amount ? Number(plEntity.amount) : 0,
            currency: plEntity?.currency || 'INR',
            status: 'CANCELLED',
          },
          update: { status: 'CANCELLED' },
        });
      }
      affectedDates.add(now.toISOString().slice(0, 10));
    }

    // Mark WebhookEvent as processed
    if (eventId) {
      await this.prisma.webhookEvent.updateMany({
        where: { eventId },
        data: { processedAt: new Date() },
      });
    }

    // 6. Trigger rollup
    if (affectedDates.size === 0) {
      affectedDates.add(now.toISOString().slice(0, 10));
    }

    for (const date of affectedDates) {
      await this.rollupQueue.add(
        'rollup',
        { tenantId, date },
        { attempts: 3, removeOnComplete: true },
      );
    }
  }
}
