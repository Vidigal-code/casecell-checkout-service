export interface TokenRevocationStore {
  revoke(tokenHash: string, ttlSeconds: number): Promise<void>;
  isRevoked(tokenHash: string): Promise<boolean>;
}
