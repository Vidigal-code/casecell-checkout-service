import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@shared/tokens';
import { TokenPair, TokenService } from '../ports/token-service';

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
