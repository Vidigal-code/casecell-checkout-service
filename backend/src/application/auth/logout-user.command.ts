import { Inject, Injectable } from '@nestjs/common';
import { ValidationError } from '@domain/common/errors';
import { TokenService } from '@application/ports/token-service';
import { TOKENS } from '@shared/tokens';

export interface LogoutUserInput {
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
}

@Injectable()
export class LogoutUserCommand {
  constructor(
    @Inject(TOKENS.TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: LogoutUserInput): Promise<LogoutResponse> {
    if (!input.refreshToken) {
      throw new ValidationError('Refresh token is required for logout.');
    }

    await this.tokenService.revoke(input.refreshToken);

    return { success: true };
  }
}
