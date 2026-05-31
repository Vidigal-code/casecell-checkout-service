export interface CircuitBreakerService {
  canExecute(key: string): Promise<boolean>;
  recordSuccess(key: string): Promise<void>;
  recordFailure(key: string): Promise<void>;
}
