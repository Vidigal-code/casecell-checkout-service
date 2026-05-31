export interface IdempotencyRecord<T = unknown> {
  key: string;
  response: T;
  createdAt: Date;
}

export interface IdempotencyStore {
  get<T = unknown>(key: string): Promise<IdempotencyRecord<T> | null>;
  set<T = unknown>(key: string, response: T, ttlSeconds: number): Promise<void>;
}
