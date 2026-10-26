import { Processor, Process } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface IngestJobData {
  type: 'message_sent' | 'reply_received' | 'payment_link_shared' | 'payment_received';
  contact?: string; // phone number
  agent?: string; // agent name
  timestamp?: string;
  amount?: number;
  currency?: string;
  reference?: string;
  metadata?: Record<string, any>;
  tenantId?: string;
  eventId: string;
}

@Processor('ingest-events')
export class IngestProcessor {
  private readonly logger = new Logger(IngestProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('rollup') private readonly rollupQueue: Queue,
  ) {}

  @Process('process')
  async handleIngestEvent(job: Job<IngestJobData>) {
    const data = job.data;
    this.logger.log(`Processing ingest event: ${data.type} (event ID: ${data.eventId})`);

    // Resolve tenant
    let tenantId = data.tenantId;
    if (!tenantId) {
      const firstTenant = await this.prisma.tenant.findFirst();
      if (!firstTenant) {
        this.logger.error('No tenant found in database for ingest event');
        return;
      }
      tenantId = firstTenant.id;
    }

    const ts = data.timestamp ? new Date(data.timestamp) : new Date();

    // Upsert Agent if provided
    let agentId: string | undefined;
    if (data.agent) {
      const agent = await this.prisma.agent.upsert({
        where: {
          tenantId_name: {
            tenantId,
            name: data.agent,
          },
        },
        create: {
          tenantId,
          name: data.agent,
        },
        update: {},
      });
      agentId = agent.id;
    }

    // Upsert Contact if phone provided
    let contactId: string | undefined;
    if (data.contact) {
      const contact = await this.prisma.contact.upsert({
        where: {
          tenantId_phone: {
            tenantId,
            phone: data.contact,
          },
        },
        create: {
          tenantId,
          phone: data.contact,
          name: data.contact,
        },
        update: {},
      });
      contactId = contact.id;
    }

    const ref = data.reference || data.eventId;
    const body = data.metadata?.body || null;

    switch (data.type) {
      case 'message_sent': {
        await this.prisma.message.upsert({
          where: { waMessageId: data.eventId },
          create: {
            tenantId,
            waMessageId: data.eventId,
            direction: 'OUTBOUND',
            status: 'SENT',
            agentId,
            contactId,
            body,
            sentAt: ts,
            createdAt: ts,
            rawPayload: data.metadata || (data as any),
          },
          update: {
            direction: 'OUTBOUND',
            agentId: agentId || undefined,
            contactId: contactId || undefined,
            sentAt: ts,
            body: body || undefined,
          },
        });
        break;
      }

      case 'reply_received': {
        await this.prisma.message.upsert({
          where: { waMessageId: data.eventId },
          create: {
            tenantId,
            waMessageId: data.eventId,
            direction: 'INBOUND',
            status: 'SENT',
            agentId,
            contactId,
            body,
            sentAt: ts,
            createdAt: ts,
            rawPayload: data.metadata || (data as any),
          },
          update: {
            direction: 'INBOUND',
            agentId: agentId || undefined,
            contactId: contactId || undefined,
            body: body || undefined,
          },
        });
        break;
      }

      case 'payment_link_shared': {
        await this.prisma.paymentLink.upsert({
          where: { providerRef: ref },
          create: {
            tenantId,
            providerRef: ref,
            provider: 'generic',
            amount: data.amount ? Number(data.amount) : 0,
            currency: data.currency || 'INR',
            status: 'SHARED',
            sharedAt: ts,
            createdAt: ts,
            messageId: data.metadata?.messageId || undefined,
          },
          update: {
            status: 'SHARED',
            amount: data.amount ? Number(data.amount) : undefined,
            currency: data.currency || undefined,
            sharedAt: ts,
            messageId: data.metadata?.messageId || undefined,
          },
        });
        break;
      }

      case 'payment_received': {
        // Link to existing PaymentLink if found
        const existingLink = await this.prisma.paymentLink.findFirst({
          where: {
            tenantId,
            providerRef: ref,
          },
        });

        if (existingLink) {
          await this.prisma.paymentLink.update({
            where: { id: existingLink.id },
            data: {
              status: 'PAID',
              paidAt: ts,
            },
          });
        }

        await this.prisma.payment.upsert({
          where: { providerRef: ref },
          create: {
            tenantId,
            providerRef: ref,
            paymentLinkId: existingLink?.id,
            amount: data.amount ? Number(data.amount) : (existingLink?.amount || 0),
            currency: data.currency || existingLink?.currency || 'INR',
            status: 'captured',
            paidAt: ts,
            createdAt: ts,
            rawPayload: data.metadata || (data as any),
          },
          update: {
            paymentLinkId: existingLink?.id || undefined,
            amount: data.amount ? Number(data.amount) : undefined,
            currency: data.currency || undefined,
            status: 'captured',
            paidAt: ts,
            rawPayload: data.metadata || (data as any),
          },
        });
        break;
      }

      default:
        this.logger.warn(`Unknown ingest event type: ${(data as any).type}`);
    }

    // Mark WebhookEvent as processed
    if (data.eventId) {
      await this.prisma.webhookEvent.updateMany({
        where: { eventId: data.eventId },
        data: { processedAt: new Date() },
      });
    }

    // Trigger rollup
    const dateStr = ts.toISOString().slice(0, 10);
    await this.rollupQueue.add(
      'rollup',
      { tenantId, date: dateStr },
      { attempts: 3, removeOnComplete: true },
    );
  }
}
