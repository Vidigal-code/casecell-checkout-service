import { Injectable } from '@nestjs/common';
import { AppLogger } from '@application/ports/logger';
import pino, { Logger, StreamEntry } from 'pino';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PinoLoggerService implements AppLogger {
  private readonly logger: Logger;

  constructor() {
    const logLevel = this.resolveLogLevel();
    const targets = this.resolveTargets(logLevel);
    this.logger = pino({ level: logLevel, transport: { targets } });
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

  private resolveTargets(level: string): StreamEntry[] {
    const consoleTarget: StreamEntry = { level, target: 'pino-pretty', options: { colorize: true } };
    const fileTarget = this.createFileTarget(level);
    return fileTarget ? [consoleTarget, fileTarget] : [consoleTarget];
  }

  private createFileTarget(level: string): StreamEntry | null {
    if (process.env.LOG_FILE_ENABLED !== 'true') {
      return null;
    }

    const filePath = process.env.LOG_FILE_PATH ?? 'logs/api.log';
    this.ensureDirectoryExists(path.dirname(filePath));

    const stream = fs.createWriteStream(filePath, { flags: 'a' });
    return { level, stream };
  }

  private ensureDirectoryExists(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }
}
