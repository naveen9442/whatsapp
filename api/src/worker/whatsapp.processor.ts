import { Processor, Process } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Processor('whatsapp-events')
export class WhatsappProcessor {
  private readonly logger = new Logger(WhatsappProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @InjectQueue('rollup') private readonly rollupQueue: Queue,
  ) {}

  @Process('process')
  async handleWhatsappEvent(job: Job<any>) {
    const rawData = job.data;
    this.logger.log(`Processing WhatsApp event: job ID ${job.id}`);

    const payload = rawData.payload || rawData;
    const eventId = rawData.eventId || rawData.id;

    // Resolve tenant
    let tenantId = rawData.tenantId;
    if (!tenantId) {
      const firstTenant = await this.prisma.tenant.findFirst();
      if (!firstTenant) {
        this.logger.error('No tenant found in database for WhatsApp event');
        return;
      }
      tenantId = firstTenant.id;
    }

    const affectedDates = new Set<string>();

    const entries = Array.isArray(payload.entry) ? payload.entry : [];
    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change.value;
        if (!value) continue;

        // Extract contacts map for profile names if present
        const contactMap = new Map<string, string>();
        if (Array.isArray(value.contacts)) {
          for (const c of value.contacts) {
            if (c.wa_id && c.profile?.name) {
              contactMap.set(c.wa_id, c.profile.name);
            }
          }
        }

        // 1. Process Statuses (Outbound message status updates)
        if (Array.isArray(value.statuses)) {
          for (const statusItem of value.statuses) {
            const waMessageId = statusItem.id;
            if (!waMessageId) continue;

            const tsDate = this.parseTimestamp(statusItem.timestamp);
            const dateStr = tsDate.toISOString().slice(0, 10);
            affectedDates.add(dateStr);

            const status = this.mapStatus(statusItem.status);
            const errorsJson = statusItem.errors ? JSON.stringify(statusItem.errors) : null;

            // Check if message already exists
            const existingMessage = await this.prisma.message.findUnique({
              where: { waMessageId },
            });

            const sentAt = status === 'SENT' ? tsDate : existingMessage?.sentAt;
            const deliveredAt = status === 'DELIVERED' ? tsDate : existingMessage?.deliveredAt;
            const readAt = status === 'READ' ? tsDate : existingMessage?.readAt;
            const failedAt = status === 'FAILED' ? tsDate : existingMessage?.failedAt;

            const message = await this.prisma.message.upsert({
              where: { waMessageId },
              create: {
                tenantId,
                waMessageId,
                direction: 'OUTBOUND',
                status,
                sentAt: status === 'SENT' ? tsDate : undefined,
                deliveredAt: status === 'DELIVERED' ? tsDate : undefined,
                readAt: status === 'READ' ? tsDate : undefined,
                failedAt: status === 'FAILED' ? tsDate : undefined,
                error: errorsJson,
                rawPayload: statusItem,
                createdAt: tsDate,
              },
              update: {
                status,
                sentAt: sentAt ?? undefined,
                deliveredAt: deliveredAt ?? undefined,
                readAt: readAt ?? undefined,
                failedAt: failedAt ?? undefined,
                error: errorsJson ?? existingMessage?.error,
                rawPayload: statusItem,
              },
            });

            // Check for payment link in message body if outbound message has a body
            if (message.body) {
              await this.detectAndStorePaymentLink(message.id, message.body, tenantId, tsDate);
            }
          }
        }

        // 2. Process Inbound Messages (Customer replies)
        if (Array.isArray(value.messages)) {
          for (const msg of value.messages) {
            const waMessageId = msg.id;
            if (!waMessageId) continue;

            const tsDate = this.parseTimestamp(msg.timestamp);
            const dateStr = tsDate.toISOString().slice(0, 10);
            affectedDates.add(dateStr);

            const phone = msg.from;
            const contactName = contactMap.get(phone) || phone;

            // Upsert Contact
            let contactId: string | undefined;
            if (phone) {
              const contact = await this.prisma.contact.upsert({
                where: {
                  tenantId_phone: {
                    tenantId,
                    phone,
                  },
                },
                create: {
                  tenantId,
                  phone,
                  name: contactName,
                },
                update: {
                  name: contactName,
                },
              });
              contactId = contact.id;
            }

            const body =
              msg.text?.body || (msg.type !== 'text' ? `[${msg.type || 'media'}]` : null);

            await this.prisma.message.upsert({
              where: { waMessageId },
              create: {
                tenantId,
                waMessageId,
                direction: 'INBOUND',
                status: 'SENT',
                contactId,
                body,
                sentAt: tsDate,
                rawPayload: msg,
                createdAt: tsDate,
              },
              update: {
                direction: 'INBOUND',
                contactId: contactId ?? undefined,
                body: body ?? undefined,
                rawPayload: msg,
              },
            });
          }
        }
      }
    }

    // 4. Mark WebhookEvent as processed
    if (eventId) {
      await this.prisma.webhookEvent.updateMany({
        where: { eventId },
        data: { processedAt: new Date() },
      });
    }

    // 5. Trigger rollup for affected dates
    if (affectedDates.size === 0) {
      affectedDates.add(new Date().toISOString().slice(0, 10));
    }

    for (const date of affectedDates) {
      await this.rollupQueue.add(
        'rollup',
        { tenantId, date },
        { attempts: 3, removeOnComplete: true },
      );
    }
  }

  /**
   * Check message body for payment link patterns and upsert PaymentLink with status SHARED.
   */
  private async detectAndStorePaymentLink(
    messageId: string,
    body: string,
    tenantId: string,
    sharedAt: Date,
  ): Promise<void> {
    const patternStr =
      this.config.get<string>('PAYMENT_LINK_PATTERNS') ||
      process.env.PAYMENT_LINK_PATTERNS ||
      'rzp\\.io|razorpay\\.com/pl_|pay\\.cashfree\\.com';

    const regex = new RegExp(`(?:https?://[^\\s]+)?(?:${patternStr})[^\\s]*`, 'gi');
    const matches = body.match(regex);
    if (!matches || matches.length === 0) return;

    for (const rawUrl of matches) {
      const url = rawUrl.trim();
      // Extract identifier or use full URL
      const providerRef = url;

      await this.prisma.paymentLink.upsert({
        where: { providerRef },
        create: {
          tenantId,
          providerRef,
          provider: 'razorpay',
          amount: 0,
          currency: 'INR',
          status: 'SHARED',
          messageId,
          sharedAt,
        },
        update: {
          status: 'SHARED',
          messageId,
          sharedAt,
        },
      });
      this.logger.log(`Detected payment link ${providerRef} for message ${messageId}`);
    }
  }

  private mapStatus(status: string): 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'DELIVERED';
      case 'read':
        return 'READ';
      case 'failed':
        return 'FAILED';
      case 'sent':
      default:
        return 'SENT';
    }
  }

  private parseTimestamp(timestamp: any): Date {
    if (!timestamp) return new Date();
    const tsNum = Number(timestamp);
    if (isNaN(tsNum) || tsNum <= 0) return new Date();
    return tsNum > 1e11 ? new Date(tsNum) : new Date(tsNum * 1000);
  }
}
