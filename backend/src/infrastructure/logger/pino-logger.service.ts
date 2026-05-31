import { Injectable } from '@nestjs/common';
import { AppLogger } from '@application/ports/logger';
import pino, { Logger } from 'pino';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PinoLoggerService implements AppLogger {
  private readonly logger: Logger;

  constructor() {
    const logLevel = (process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')).toLowerCase();
    const targets: any[] = [];

    if (process.env.LOG_FILE_ENABLED === 'true') {
      const filePath = process.env.LOG_FILE_PATH ?? 'logs/api.log';
      const directory = path.dirname(filePath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      const rotationWhen = process.env.LOG_ROTATION_WHEN ?? '1d';
      const interval = rotationWhen === 'midnight' ? '1d' : rotationWhen;
      const maxFiles = Number(process.env.LOG_BACKUP_COUNT ?? 7);

      targets.push({
        level: logLevel,
        target: './rotating-file-target',
        options: {
          file: filePath,
          interval,
          maxFiles,
        },
      });
    }

    targets.push({ level: logLevel, target: 'pino-pretty', options: { colorize: true } });

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
}
