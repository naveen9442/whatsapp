import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private prisma: PrismaService) {}

  async storeRawEvent(
    source: string,
    eventId: string,
    payload: any,
    tenantId?: string,
  ): Promise<{ isNew: boolean }> {
    try {
      await this.prisma.webhookEvent.create({
        data: { source, eventId, rawPayload: payload, tenantId },
      });
      return { isNew: true };
    } catch (e: any) {
      // Unique constraint violation = duplicate
      if (e.code === 'P2002') {
        this.logger.debug(`Duplicate event ${eventId} from ${source} — skipping`);
        return { isNew: false };
      }
      throw e;
    }
  }
}
