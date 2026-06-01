import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { existsSync } from 'fs';
import { join } from 'path';
import { configValidationSchema } from '@config/validation';
import { CoreProvidersModule } from '@infrastructure/core/core-providers.module';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { ErpSyncQueueModule } from '@infrastructure/queues/erp-sync.queue.module';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { TelemetryModule } from '@infrastructure/telemetry/telemetry.module';
import configuration from '../config/configuration';
import { AuthModule } from './http/auth/auth.module';
import { CheckoutModule } from './http/checkout/checkout.module';
import { DomainExceptionFilter } from './http/common/domain-exception.filter';
import { RateLimitGuard } from './http/common/rate-limit.guard';
import { HealthModule } from './http/health/health.module';
import { LoggerInterceptor } from './http/logger/logger.interceptor';
import { MetricsModule } from './http/metrics/metrics.module';
import { OrdersModule } from './http/orders/orders.module';
import { ProductsModule } from './http/products/products.module';

const envFilePathCandidates = [
  join(__dirname, '../../.env.local'),
  join(__dirname, '../../.env'),
  join(__dirname, '../../../.env.local'),
  join(__dirname, '../../../.env'),
];

const envFilePaths = envFilePathCandidates.filter((filePath) => existsSync(filePath));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
      envFilePath: envFilePaths.length > 0 ? envFilePaths : undefined,
      expandVariables: true,
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
    CoreProvidersModule,
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
