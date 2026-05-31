import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';
import { ErpSyncProcessor } from './erp-sync.processor';

@Injectable()
export class ErpSyncWorker implements OnModuleDestroy {
  private readonly worker: Worker;

  constructor(
    private readonly config: ConfigService,
    private readonly processor: ErpSyncProcessor,
  ) {
    const connection = {
      host: this.config.get<string>('redis.host', 'localhost'),
      port: this.config.get<number>('redis.port', 6379),
      password: this.config.get<string>('redis.password') || undefined,
    };

    this.worker = new Worker('erp-sync', (job) => this.processor.process(job), { connection });
    this.worker.on('completed', (job) => this.processor.onCompleted(job));
    this.worker.on('failed', (job, err) => job && this.processor.onFailed(job, err));
  }

  async onModuleDestroy() {
    await this.worker.close();
  }
}
