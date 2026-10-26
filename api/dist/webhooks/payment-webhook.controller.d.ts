import { ConfigService } from '@nestjs/config';
import { WebhookService } from './webhook.service';
import { QueueService } from '../queue/queue.service';
export declare class PaymentWebhookController {
    private config;
    private webhookService;
    private queueService;
    private readonly logger;
    constructor(config: ConfigService, webhookService: WebhookService, queueService: QueueService);
    receive(provider: string, headers: Record<string, string>, body: any, req: any): Promise<{
        status: string;
    }>;
    private verifySignature;
}
