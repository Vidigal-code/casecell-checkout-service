import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CreateCheckoutCommand } from '@application/checkout/create-checkout.command';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';
import { TOKENS } from '@shared/tokens';
import { PrismaOrderRepository } from '@infrastructure/order/prisma-order.repository';
import { RedisIdempotencyStore } from '@infrastructure/redis/redis-idempotency.store';
import { RedisLockManager } from '@infrastructure/redis/redis-lock.manager';
import { ErpSimulatorService } from '@infrastructure/erp/erp-simulator.service';
import { PinoLoggerService } from '@infrastructure/logger/pino-logger.service';
import { ErpSyncQueueModule } from '@infrastructure/queues/erp-sync.queue.module';
import { EnqueueErpSyncCommand } from '@application/checkout/enqueue-erp-sync.command';
import { ErpSyncProcessor } from '@infrastructure/queues/erp-sync.processor';
import { RedisCircuitBreakerService } from '@infrastructure/circuit-breaker/redis-circuit-breaker.service';

@Module({
  imports: [ProductsModule, AuthModule, ErpSyncQueueModule],
  controllers: [CheckoutController],
  providers: [
    CreateCheckoutCommand,
    EnqueueErpSyncCommand,
    ErpSyncProcessor,
    {
      provide: TOKENS.ORDER_REPOSITORY,
      useClass: PrismaOrderRepository,
    },
    {
      provide: TOKENS.IDEMPOTENCY_STORE,
      useClass: RedisIdempotencyStore,
    },
    {
      provide: TOKENS.LOCK_MANAGER,
      useClass: RedisLockManager,
    },
    {
      provide: TOKENS.ERP_GATEWAY,
      useClass: ErpSimulatorService,
    },
    {
      provide: TOKENS.LOGGER,
      useClass: PinoLoggerService,
    },
    {
      provide: TOKENS.CIRCUIT_BREAKER,
      useClass: RedisCircuitBreakerService,
    },
  ],
})
export class CheckoutModule {}
