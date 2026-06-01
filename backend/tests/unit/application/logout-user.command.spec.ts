import { LogoutUserCommand } from '@application/auth/logout-user.command';
import { TokenService } from '@application/ports/token-service';
import { ValidationError } from '@domain/common/errors';

describe('LogoutUserCommand', () => {
  const tokenService: jest.Mocked<TokenService> = {
    generateTokens: jest.fn(),
    refreshToken: jest.fn(),
    revoke: jest.fn(),
  };

  const command = new LogoutUserCommand(tokenService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('revokes refresh token and resolves with success', async () => {
    const result = await command.execute({ refreshToken: 'token-123' });

    expect(tokenService.revoke).toHaveBeenCalledWith('token-123');
    expect(result).toEqual({ success: true });
  });

  it('throws when refresh token is missing', async () => {
    await expect(command.execute({ refreshToken: '' })).rejects.toBeInstanceOf(ValidationError);
    expect(tokenService.revoke).not.toHaveBeenCalled();
  });
});
