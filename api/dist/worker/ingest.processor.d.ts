import { Job, Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
export interface IngestJobData {
    type: 'message_sent' | 'reply_received' | 'payment_link_shared' | 'payment_received';
    contact?: string;
    agent?: string;
    timestamp?: string;
    amount?: number;
    currency?: string;
    reference?: string;
    metadata?: Record<string, any>;
    tenantId?: string;
    eventId: string;
}
export declare class IngestProcessor {
    private readonly prisma;
    private readonly rollupQueue;
    private readonly logger;
    constructor(prisma: PrismaService, rollupQueue: Queue);
    handleIngestEvent(job: Job<IngestJobData>): Promise<void>;
}
