import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { WhatsappWebhookController } from './whatsapp-webhook.controller';
import { PaymentWebhookController } from './payment-webhook.controller';
import { IngestController } from './ingest.controller';
import { WebhookService } from './webhook.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    QueueModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  ],
  controllers: [
    WhatsappWebhookController,
    PaymentWebhookController,
    IngestController,
  ],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhooksModule {}
