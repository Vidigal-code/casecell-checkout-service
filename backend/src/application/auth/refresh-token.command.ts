import { Inject, Injectable } from '@nestjs/common';
import { TokenPair, TokenService } from '../ports/token-service';
import { TOKENS } from '@shared/tokens';

@Injectable()
export class RefreshTokenCommand {
  constructor(
    @Inject(TOKENS.TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  execute(refreshToken: string): Promise<TokenPair> {
    return this.tokenService.refreshToken(refreshToken);
  }
}
