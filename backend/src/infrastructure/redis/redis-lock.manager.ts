import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { LockManager } from '@application/ports/lock-manager';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisLockManager implements LockManager {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async acquire(key: string, ttlMs: number): Promise<boolean> {
    const result = await this.redis.set(this.formatKey(key), 'locked', 'PX', ttlMs, 'NX');
    return result === 'OK';
  }

  async release(key: string): Promise<void> {
    await this.redis.del(this.formatKey(key));
  }

  private formatKey(key: string): string {
    return `lock:${key}`;
  }
}
