import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { MetricsService } from '../metrics/metrics.service';

export interface RollupJobData {
  tenantId: string;
  date: string | Date;
}

@Processor('rollup')
export class RollupProcessor {
  private readonly logger = new Logger(RollupProcessor.name);

  constructor(private readonly metricsService: MetricsService) {}

  @Process('rollup')
  async handleRollup(job: Job<RollupJobData>) {
    const { tenantId, date } = job.data;
    this.logger.log(`Processing rollup job for tenant ${tenantId}, date ${date}`);
    try {
      const targetDate = typeof date === 'string' ? new Date(date) : date;
      const results = await this.metricsService.computeDailyMetrics(tenantId, targetDate);
      this.logger.log(
        `Rollup completed for tenant ${tenantId}, date ${date}. Aggregated ${results.length} record(s).`,
      );
      return results;
    } catch (error: any) {
      this.logger.error(
        `Rollup failed for tenant ${tenantId}, date ${date}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
