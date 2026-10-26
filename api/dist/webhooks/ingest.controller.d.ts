import { ConfigService } from '@nestjs/config';
import { WebhookService } from './webhook.service';
import { QueueService } from '../queue/queue.service';
import { IngestEventDto } from './dto/ingest-event.dto';
export declare class IngestController {
    private readonly config;
    private readonly webhookService;
    private readonly queueService;
    private readonly logger;
    constructor(config: ConfigService, webhookService: WebhookService, queueService: QueueService);
    private validateApiKey;
    ingestEvents(apiKey: string, body: IngestEventDto | IngestEventDto[]): Promise<{
        status: string;
        received: number;
        enqueued: number;
    }>;
    ingestCsv(apiKey: string, file: Express.Multer.File): Promise<{
        status: string;
        totalRows: number;
        enqueued: number;
    }>;
}
