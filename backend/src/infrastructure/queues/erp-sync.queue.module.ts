import { Module, Global, Inject, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { CoreProvidersModule } from '@infrastructure/core/core-providers.module';
import { TOKENS } from '@shared/tokens';
import { ErpSyncProcessor } from './erp-sync.processor';
import { ErpSyncWorker } from './erp-sync.worker';

@Global()
@Module({
  imports: [CoreProvidersModule],
  providers: [
    {
      provide: TOKENS.ERP_SYNC_QUEUE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Queue('erp-sync', {
          connection: {
            host: config.get<string>('redis.host', 'localhost'),
            port: config.get<number>('redis.port', 6379),
            password: config.get<string>('redis.password') || undefined,
          },
        }),
    },
    ErpSyncProcessor,
    ErpSyncWorker,
  ],
  exports: [TOKENS.ERP_SYNC_QUEUE],
})
export class ErpSyncQueueModule implements OnModuleDestroy {
  constructor(@Inject(TOKENS.ERP_SYNC_QUEUE) private readonly queue: Queue) {}

  async onModuleDestroy() {
    await this.queue.close();
  }
}
