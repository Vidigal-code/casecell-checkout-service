import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisIdempotencyStore } from './redis-idempotency.store';
import { RedisLockManager } from './redis-lock.manager';
import { RedisTokenRevocationStore } from './redis-token-revocation.store';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
          enableReadyCheck: true,
        });
      },
      inject: [ConfigService],
    },
    RedisIdempotencyStore,
    RedisLockManager,
    RedisTokenRevocationStore,
  ],
  exports: [REDIS_CLIENT, RedisIdempotencyStore, RedisLockManager, RedisTokenRevocationStore],
})
export class RedisModule {}
