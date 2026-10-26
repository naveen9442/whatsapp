import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('whatsapp-events') private waQueue: Queue,
    @InjectQueue('payment-events') private payQueue: Queue,
    @InjectQueue('ingest-events') private ingestQueue: Queue,
    @InjectQueue('rollup') private rollupQueue: Queue,
  ) {}

  async enqueueWhatsappEvent(payload: any) {
    await this.waQueue.add('process', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async enqueuePaymentEvent(payload: any) {
    await this.payQueue.add('process', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async enqueueIngestEvent(events: any[]) {
    const jobs = events.map(e => ({ name: 'process', data: e, opts: { attempts: 3 } }));
    await this.ingestQueue.addBulk(jobs);
  }

  async triggerRollup(tenantId: string, date: string) {
    await this.rollupQueue.add('rollup', { tenantId, date }, { attempts: 3 });
  }
}
