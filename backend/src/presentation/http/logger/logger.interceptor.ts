import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Inject } from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from '@application/ports/logger';
import { TOKENS } from '@shared/tokens';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(@Inject(TOKENS.LOGGER) private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request & { id?: string }>();
    const response = httpContext.getResponse<Response>();
    const requestIdHeader = request.headers['x-request-id'];
    const requestId = Array.isArray(requestIdHeader)
      ? requestIdHeader[0]
      : (requestIdHeader ?? randomUUID());
    const start = Date.now();

    request.id = requestId;
    response.setHeader('x-request-id', requestId);

    this.logger.info('HTTP request received', {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          this.logger.info('HTTP request completed', {
            requestId,
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            duration,
          });
        },
        error: (error: unknown) => {
          const duration = Date.now() - start;
          const normalizedError = error instanceof Error ? error.message : String(error);
          this.logger.error('HTTP request failed', {
            requestId,
            method: request.method,
            url: request.url,
            statusCode: response.statusCode,
            duration,
            error: normalizedError,
          });
        },
      }),
    );
  }
}
