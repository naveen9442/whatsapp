import { Job, Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class WhatsappProcessor {
    private readonly prisma;
    private readonly config;
    private readonly rollupQueue;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService, rollupQueue: Queue);
    handleWhatsappEvent(job: Job<any>): Promise<void>;
    private detectAndStorePaymentLink;
    private mapStatus;
    private parseTimestamp;
}
