import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '../prisma/prisma.module';
import { WhatsappProcessor } from './whatsapp.processor';
import { PaymentProcessor } from './payment.processor';
import { IngestProcessor } from './ingest.processor';
import { RollupProcessor } from './rollup.processor';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      redis: process.env.REDIS_URL || 'redis://localhost:6379',
    }),
    BullModule.registerQueue(
      { name: 'whatsapp-events' },
      { name: 'payment-events' },
      { name: 'ingest-events' },
      { name: 'rollup' },
    ),
    PrismaModule,
    MetricsModule,
  ],
  providers: [WhatsappProcessor, PaymentProcessor, IngestProcessor, RollupProcessor],
})
export class WorkerModule {}
