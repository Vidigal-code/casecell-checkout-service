import { authReducer, clearSession, setCredentials } from '@/features/auth/model/auth-slice';

describe('auth slice', () => {
  it('deve armazenar credenciais ao efetuar login', () => {
    const state = authReducer(
      undefined,
      setCredentials({
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 900,
        user: { id: '1', email: 'user@test.com', role: 'CUSTOMER' },
      }),
    );

    expect(state.accessToken).toBe('token');
    expect(state.user?.email).toBe('user@test.com');
  });

  it('deve limpar sessão', () => {
    const loggedState = authReducer(
      undefined,
      setCredentials({
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresIn: 900,
        user: { id: '1', email: 'user@test.com', role: 'CUSTOMER' },
      }),
    );

    const cleared = authReducer(loggedState, clearSession());
    expect(cleared.accessToken).toBeNull();
    expect(cleared.user).toBeNull();
  });
});
