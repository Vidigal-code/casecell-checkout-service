import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { TokenRevocationStore } from '@application/ports/token-revocation-store';
import { TokenPair, TokenService } from '@application/ports/token-service';
import { UnauthorizedError } from '@domain/common/errors';
import { TOKENS } from '@shared/tokens';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(TOKENS.TOKEN_REVOCATION_STORE)
    private readonly revocationStore: TokenRevocationStore,
  ) {}

  async generateTokens(payload: Record<string, unknown>): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRES_IN', '900s'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiration(this.config.get('JWT_ACCESS_TOKEN_EXPIRES_IN', '900s')),
    };
  }

  async refreshToken(token: string): Promise<TokenPair> {
    await this.ensureNotRevoked(token);

    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.config.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
    });

    await this.revoke(token);

    return this.generateTokens({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });
  }

  async revoke(token: string): Promise<void> {
    const ttlSeconds = this.remainingTtlSeconds(token);
    if (ttlSeconds <= 0) {
      return;
    }
    await this.revocationStore.revoke(this.hashToken(token), ttlSeconds);
  }

  private parseExpiration(value: string): number {
    if (value.endsWith('s')) {
      return Number(value.replace('s', ''));
    }
    if (value.endsWith('m')) {
      return Number(value.replace('m', '')) * 60;
    }
    if (value.endsWith('h')) {
      return Number(value.replace('h', '')) * 3600;
    }
    if (value.endsWith('d')) {
      return Number(value.replace('d', '')) * 86400;
    }
    return Number(value);
  }

  private async ensureNotRevoked(token: string) {
    const revoked = await this.revocationStore.isRevoked(this.hashToken(token));
    if (revoked) {
      throw new UnauthorizedError('Refresh token revoked.');
    }
  }

  private remainingTtlSeconds(token: string): number {
    const decoded = this.jwtService.decode(token) as { exp?: number } | null;
    if (decoded?.exp) {
      const now = Math.floor(Date.now() / 1000);
      const remaining = decoded.exp - now;
      if (remaining > 0) {
        return remaining;
      }
      return 0;
    }
    return this.parseExpiration(this.config.get('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'));
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
