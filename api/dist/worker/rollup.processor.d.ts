import { Job } from 'bull';
import { MetricsService } from '../metrics/metrics.service';
export interface RollupJobData {
    tenantId: string;
    date: string | Date;
}
export declare class RollupProcessor {
    private readonly metricsService;
    private readonly logger;
    constructor(metricsService: MetricsService);
    handleRollup(job: Job<RollupJobData>): Promise<any[]>;
}
