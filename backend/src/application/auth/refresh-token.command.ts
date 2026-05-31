import { Injectable } from '@nestjs/common';
import { TokenPair, TokenService } from '../ports/token-service';

@Injectable()
export class RefreshTokenCommand {
  constructor(private readonly tokenService: TokenService) {}

  execute(refreshToken: string): Promise<TokenPair> {
    return this.tokenService.refreshToken(refreshToken);
  }
}
