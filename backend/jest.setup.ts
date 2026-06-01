import { config } from 'dotenv';
import { resolve } from 'path';
import 'reflect-metadata';

const tryLoad = (relativePath: string) => {
  const result = config({ path: resolve(__dirname, relativePath), override: false });
  if (result.error) {
    const error = result.error as NodeJS.ErrnoException;
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

tryLoad('.env');
tryLoad('../.env');
