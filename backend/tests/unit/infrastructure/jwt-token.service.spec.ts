import { JwtTokenService } from '@infrastructure/auth/jwt-token.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenRevocationStore } from '@application/ports/token-revocation-store';
import { UnauthorizedError } from '@domain/common/errors';

describe('JwtTokenService', () => {
  const jwtService: jest.Mocked<JwtService> = {
    signAsync: jest.fn(async (_, options) =>
      options?.secret?.includes('ACCESS') ? 'access-token' : 'refresh-token',
    ),
    verifyAsync: jest.fn(async () => ({ sub: 'user-1', email: 'user@test.com', role: 'CUSTOMER' })),
    decode: jest.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 3600 })),
  } as unknown as jest.Mocked<JwtService>;

  const configService: jest.Mocked<ConfigService> = {
    getOrThrow: jest.fn((key: string) =>
      key === 'JWT_ACCESS_TOKEN_SECRET' ? 'ACCESS_SECRET' : 'REFRESH_SECRET',
    ),
    get: jest.fn((key: string, defaultValue?: unknown) => {
      if (key === 'JWT_ACCESS_TOKEN_EXPIRES_IN') {
        return '900s';
      }
      if (key === 'JWT_REFRESH_TOKEN_EXPIRES_IN') {
        return '7d';
      }
      return defaultValue;
    }),
  } as unknown as jest.Mocked<ConfigService>;

  const revocationStore: jest.Mocked<TokenRevocationStore> = {
    revoke: jest.fn(),
    isRevoked: jest.fn().mockResolvedValue(false),
  };

  const service = new JwtTokenService(jwtService, configService, revocationStore);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('generates tokens and returns pair with expiration', async () => {
    const result = await service.generateTokens({ sub: 'user-1' });

    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token', expiresIn: 900 });
  });

  it('refreshes token when not revoked and revokes previous refresh token', async () => {
    const result = await service.refreshToken('old-refresh-token');

    expect(revocationStore.isRevoked).toHaveBeenCalledWith(expect.any(String));
    expect(revocationStore.revoke).toHaveBeenCalledWith(expect.any(String), 3600);
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
  });

  it('throws when refresh token was revoked', async () => {
    revocationStore.isRevoked.mockResolvedValueOnce(true);

    await expect(service.refreshToken('revoked-token')).rejects.toBeInstanceOf(UnauthorizedError);
    expect(revocationStore.revoke).not.toHaveBeenCalled();
  });

  it('stores token hash with ttl when revoking explicitly', async () => {
    await service.revoke('refresh-token');

    expect(revocationStore.revoke).toHaveBeenCalledWith(expect.any(String), 3600);
  });
});
