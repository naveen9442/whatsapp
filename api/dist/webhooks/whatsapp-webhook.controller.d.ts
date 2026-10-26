import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { WebhookService } from './webhook.service';
import { QueueService } from '../queue/queue.service';
export declare class WhatsappWebhookController {
    private config;
    private webhookService;
    private queueService;
    private readonly logger;
    constructor(config: ConfigService, webhookService: WebhookService, queueService: QueueService);
    verify(mode: string, token: string, challenge: string, res: Response): Response<any, Record<string, any>>;
    receive(signature: string, body: any, req: Request): Promise<{
        status: string;
    }>;
}
