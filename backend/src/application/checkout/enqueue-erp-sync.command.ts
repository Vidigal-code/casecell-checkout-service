import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { TOKENS } from '@shared/tokens';
import { AppLogger } from '../ports/logger';
import { TelemetryService } from '../ports/telemetry';

export interface EnqueueErpSyncInput {
  orderId: string;
  productId: string;
  quantity: number;
  customerId: string;
  idempotencyKey: string;
}

@Injectable()
export class EnqueueErpSyncCommand {
  constructor(
    @Inject(TOKENS.ERP_SYNC_QUEUE) private readonly queue: Queue,
    @Inject(TOKENS.LOGGER) private readonly logger: AppLogger,
    @Inject(TOKENS.TELEMETRY) private readonly telemetry: TelemetryService,
  ) {}

  async execute(payload: EnqueueErpSyncInput): Promise<void> {
    this.logger.info('Enqueuing ERP sync job', { orderId: payload.orderId });
    this.telemetry.incrementCounter('checkout_total', { labels: { status: 'queued_job' } });
    await this.queue.add('sync-order', payload, {
      attempts: 1,
      backoff: undefined,
      removeOnComplete: true,
      removeOnFail: false,
    });
  }
}
