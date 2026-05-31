export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenService {
  generateTokens(payload: Record<string, unknown>): Promise<TokenPair>;
  refreshToken(token: string): Promise<TokenPair>;
}
