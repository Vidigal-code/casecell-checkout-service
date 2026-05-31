import { Inject, Injectable } from '@nestjs/common';
import { IdempotencyRecord, IdempotencyStore } from '@application/ports/idempotency-store';
import { REDIS_CLIENT } from './redis.constants';
import Redis from 'ioredis';

@Injectable()
export class RedisIdempotencyStore implements IdempotencyStore {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get<T>(key: string): Promise<IdempotencyRecord<T> | null> {
    const value = await this.redis.get(this.formatKey(key));
    if (!value) {
      return null;
    }
    const parsed = JSON.parse(value) as { response: T; createdAt: string };
    return {
      key,
      response: parsed.response,
      createdAt: new Date(parsed.createdAt),
    };
  }

  async set<T>(key: string, response: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(
      this.formatKey(key),
      JSON.stringify({ response, createdAt: new Date().toISOString() }),
      'EX',
      ttlSeconds,
    );
  }

  private formatKey(key: string): string {
    return `idempotency:${key}`;
  }
}
