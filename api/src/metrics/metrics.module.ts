import { Module } from '@nestjs/common';
import { MetricsService, RollupService } from './metrics.service';

@Module({
  providers: [MetricsService, RollupService],
  exports: [MetricsService, RollupService],
})
export class MetricsModule {}
