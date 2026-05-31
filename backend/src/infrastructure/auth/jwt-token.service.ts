import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPair, TokenService } from '@application/ports/token-service';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwtService: JwtService, private readonly config: ConfigService) {}

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
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.config.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
    });

    return this.generateTokens({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });
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
}
