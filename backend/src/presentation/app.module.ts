import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from '../config/configuration';
import { configValidationSchema } from '@config/validation';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { AuthModule } from './http/auth/auth.module';
import { ProductsModule } from './http/products/products.module';
import { CheckoutModule } from './http/checkout/checkout.module';
import { OrdersModule } from './http/orders/orders.module';
import { HealthModule } from './http/health/health.module';
import { ErpSyncQueueModule } from '@infrastructure/queues/erp-sync.queue.module';
import { TelemetryModule } from '@infrastructure/telemetry/telemetry.module';
import { MetricsModule } from './http/metrics/metrics.module';
import { RateLimitGuard } from './http/common/rate-limit.guard';
import { LoggerInterceptor } from './http/logger/logger.interceptor';
import { DomainExceptionFilter } from './http/common/domain-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: Number(config.get('rateLimit.ttl', 60)),
            limit: Number(config.get('rateLimit.max', 30)),
          },
        ],
      }),
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    ProductsModule,
    CheckoutModule,
    OrdersModule,
    HealthModule,
    ErpSyncQueueModule,
    TelemetryModule,
    MetricsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule {}
