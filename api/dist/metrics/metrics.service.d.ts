import { PrismaService } from '../prisma/prisma.service';
export interface DailyMetricResult {
    messagesSent: number;
    delivered: number;
    read: number;
    failed: number;
    replies: number;
    linksShared: number;
    paymentsReceived: number;
    amountReceived: number;
}
export declare class MetricsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    computeDailyMetrics(tenantId: string, date: Date | string): Promise<any[]>;
}
export { MetricsService as RollupService };
