import { Global, Module } from '@nestjs/common';
import { RedisCircuitBreakerService } from '@infrastructure/circuit-breaker/redis-circuit-breaker.service';
import { ErpSimulatorService } from '@infrastructure/erp/erp-simulator.service';
import { PinoLoggerService } from '@infrastructure/logger/pino-logger.service';
import { PrismaOrderRepository } from '@infrastructure/order/prisma-order.repository';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { PrismaProductRepository } from '@infrastructure/product/prisma-product.repository';
import { RedisProductsCache } from '@infrastructure/product/redis-products.cache';
import { RedisIdempotencyStore } from '@infrastructure/redis/redis-idempotency.store';
import { RedisLockManager } from '@infrastructure/redis/redis-lock.manager';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { TOKENS } from '@shared/tokens';

@Global()
@Module({
  imports: [PrismaModule, RedisModule],
  providers: [
    PrismaOrderRepository,
    PrismaProductRepository,
    RedisProductsCache,
    RedisIdempotencyStore,
    RedisLockManager,
    ErpSimulatorService,
    PinoLoggerService,
    RedisCircuitBreakerService,
    {
      provide: TOKENS.ORDER_REPOSITORY,
      useExisting: PrismaOrderRepository,
    },
    {
      provide: TOKENS.PRODUCT_REPOSITORY,
      useExisting: PrismaProductRepository,
    },
    {
      provide: TOKENS.PRODUCTS_CACHE,
      useExisting: RedisProductsCache,
    },
    {
      provide: TOKENS.IDEMPOTENCY_STORE,
      useExisting: RedisIdempotencyStore,
    },
    {
      provide: TOKENS.LOCK_MANAGER,
      useExisting: RedisLockManager,
    },
    {
      provide: TOKENS.ERP_GATEWAY,
      useExisting: ErpSimulatorService,
    },
    {
      provide: TOKENS.LOGGER,
      useExisting: PinoLoggerService,
    },
    {
      provide: TOKENS.CIRCUIT_BREAKER,
      useExisting: RedisCircuitBreakerService,
    },
  ],
  exports: [
    TOKENS.ORDER_REPOSITORY,
    TOKENS.PRODUCT_REPOSITORY,
    TOKENS.PRODUCTS_CACHE,
    TOKENS.IDEMPOTENCY_STORE,
    TOKENS.LOCK_MANAGER,
    TOKENS.ERP_GATEWAY,
    TOKENS.LOGGER,
    TOKENS.CIRCUIT_BREAKER,
    PrismaOrderRepository,
    PrismaProductRepository,
    RedisProductsCache,
    RedisIdempotencyStore,
    RedisLockManager,
    ErpSimulatorService,
    PinoLoggerService,
    RedisCircuitBreakerService,
  ],
})
export class CoreProvidersModule {}
