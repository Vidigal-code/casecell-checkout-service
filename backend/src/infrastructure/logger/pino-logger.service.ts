import { Injectable } from '@nestjs/common';
import { AppLogger } from '@application/ports/logger';
import pino, { Logger, LoggerOptions } from 'pino';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PinoLoggerService implements AppLogger {
  private readonly logger: Logger;

  constructor() {
    const logLevel = this.resolveLogLevel();
    const options = this.resolveLoggerOptions(logLevel);
    this.logger = pino(options);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(meta ?? {}, message);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(meta ?? {}, message);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(meta ?? {}, message);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(meta ?? {}, message);
  }

  private resolveLogLevel(): string {
    return (process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')).toLowerCase();
  }

  private resolveLoggerOptions(level: string): LoggerOptions {
    const consoleTransport = { target: 'pino-pretty', level, options: { colorize: true } };
    const fileTransport = this.createFileTransport(level);

    if (fileTransport) {
      return {
        level,
        transport: {
          targets: [consoleTransport, fileTransport],
        },
      };
    }

    return {
      level,
      transport: {
        targets: [consoleTransport],
      },
    };
  }

  private createFileTransport(level: string) {
    if (process.env.LOG_FILE_ENABLED !== 'true') {
      return null;
    }

    const filePath = process.env.LOG_FILE_PATH ?? 'logs/api.log';
    this.ensureDirectoryExists(path.dirname(filePath));
    return {
      target: 'pino/file',
      level,
      options: {
        destination: filePath,
        mkdir: true,
      },
    };
  }

  private ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }
}
