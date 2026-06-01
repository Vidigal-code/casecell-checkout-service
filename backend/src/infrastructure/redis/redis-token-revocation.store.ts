import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { TokenRevocationStore } from '@application/ports/token-revocation-store';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisTokenRevocationStore implements TokenRevocationStore {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async revoke(tokenHash: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(this.key(tokenHash), 'revoked', 'EX', ttlSeconds);
  }

  async isRevoked(tokenHash: string): Promise<boolean> {
    const exists = await this.redis.exists(this.key(tokenHash));
    return exists === 1;
  }

  private key(tokenHash: string) {
    return `auth:revoked-token:${tokenHash}`;
  }
}
