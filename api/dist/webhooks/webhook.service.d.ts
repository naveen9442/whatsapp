import { PrismaService } from '../prisma/prisma.service';
export declare class WebhookService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    storeRawEvent(source: string, eventId: string, payload: any, tenantId?: string): Promise<{
        isNew: boolean;
    }>;
}
