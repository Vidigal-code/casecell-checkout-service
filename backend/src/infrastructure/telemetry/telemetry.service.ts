import { Injectable } from '@nestjs/common';
import { context, trace } from '@opentelemetry/api';
import { Counter, Histogram, register, collectDefaultMetrics } from 'prom-client';
import {
  TelemetryService,
  TelemetryCounterOptions,
  TelemetryDurationOptions,
} from '@application/ports/telemetry';

const checkoutCounter = new Counter({
  name: 'casecell_checkout_total',
  help: 'Total de tentativas de checkout',
  labelNames: ['status'],
});

const erpSyncDuration = new Histogram({
  name: 'casecell_erp_sync_duration_ms',
  help: 'Duração do processamento ERP em ms',
  buckets: [50, 100, 250, 500, 1000, 2000, 5000],
  labelNames: ['result'],
});

@Injectable()
export class TelemetryServiceImpl implements TelemetryService {
  get metricsRegister() {
    return register;
  }

  constructor() {
    collectDefaultMetrics();
  }

  incrementCounter(name: string, options?: TelemetryCounterOptions): void {
    switch (name) {
      case 'checkout_total':
        if (options?.labels) {
          checkoutCounter.inc(options.labels as Record<string, string>, 1);
        } else {
          checkoutCounter.inc();
        }
        break;
      default:
        break;
    }
  }

  observeDuration(name: string, options: TelemetryDurationOptions): void {
    switch (name) {
      case 'erp_sync_duration':
        if (options.labels) {
          erpSyncDuration.observe(options.labels as Record<string, string>, options.durationMs);
        } else {
          erpSyncDuration.observe({}, options.durationMs);
        }
        break;
      default:
        break;
    }
  }

  startSpan(name: string, attributes?: Record<string, string | number | boolean>): () => void {
    const tracer = trace.getTracer('casecell');
    const span = tracer.startSpan(name, undefined, context.active());
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => span.setAttribute(key, value));
    }
    return () => span.end();
  }
}
