import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CircuitBreakerService } from '@application/ports/circuit-breaker';
import { REDIS_CLIENT } from '../redis/redis.constants';

@Injectable()
export class RedisCircuitBreakerService implements CircuitBreakerService {
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {
    this.failureThreshold = Number(this.config.get('circuitBreaker.failureThreshold', 5));
    this.resetTimeoutMs = Number(this.config.get('circuitBreaker.resetTimeoutMs', 60000));
  }

  async canExecute(key: string): Promise<boolean> {
    const state = await this.redis.hgetall(this.stateKey(key));
    if (!state || !state.status) {
      return true;
    }
    if (state.status === 'open') {
      const openedAt = Number(state.openedAt ?? 0);
      if (Date.now() - openedAt > this.resetTimeoutMs) {
        await this.redis.hset(this.stateKey(key), { status: 'half-open' });
        return true;
      }
      return false;
    }
    return true;
  }

  async recordSuccess(key: string): Promise<void> {
    await this.redis.del(this.stateKey(key), this.failureKey(key));
  }

  async recordFailure(key: string): Promise<void> {
    const failures = await this.redis.incr(this.failureKey(key));
    await this.redis.pexpire(this.failureKey(key), this.resetTimeoutMs);
    if (failures >= this.failureThreshold) {
      await this.redis.hset(this.stateKey(key), {
        status: 'open',
        openedAt: Date.now().toString(),
      });
    }
  }

  private failureKey(key: string): string {
    return `cb:${key}:failures`;
  }

  private stateKey(key: string): string {
    return `cb:${key}:state`;
  }
}
