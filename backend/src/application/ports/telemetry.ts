export interface TelemetryCounterOptions {
  labels?: Record<string, string | number>;
}

export interface TelemetryDurationOptions extends TelemetryCounterOptions {
  durationMs: number;
}

export interface TelemetryService {
  incrementCounter(name: string, options?: TelemetryCounterOptions): void;
  observeDuration(name: string, options: TelemetryDurationOptions): void;
  startSpan(name: string, attributes?: Record<string, unknown>): () => void;
}
