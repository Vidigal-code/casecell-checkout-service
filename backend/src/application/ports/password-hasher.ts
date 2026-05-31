export interface PasswordHasher {
  compare(raw: string, hash: string): Promise<boolean>;
  hash(raw: string): Promise<string>;
}
