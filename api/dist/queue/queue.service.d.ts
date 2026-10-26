import { Queue } from 'bull';
export declare class QueueService {
    private waQueue;
    private payQueue;
    private ingestQueue;
    private rollupQueue;
    constructor(waQueue: Queue, payQueue: Queue, ingestQueue: Queue, rollupQueue: Queue);
    enqueueWhatsappEvent(payload: any): Promise<void>;
    enqueuePaymentEvent(payload: any): Promise<void>;
    enqueueIngestEvent(events: any[]): Promise<void>;
    triggerRollup(tenantId: string, date: string): Promise<void>;
}
