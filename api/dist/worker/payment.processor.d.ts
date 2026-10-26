import { Job, Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentProcessor {
    private readonly prisma;
    private readonly rollupQueue;
    private readonly logger;
    constructor(prisma: PrismaService, rollupQueue: Queue);
    handlePaymentEvent(job: Job<any>): Promise<void>;
}
