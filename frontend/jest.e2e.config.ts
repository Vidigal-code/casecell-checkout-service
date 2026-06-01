import type { Config } from 'jest';
import baseConfig from './jest.base.config';

const config: Config = {
  ...baseConfig,
  testMatch: ['<rootDir>/tests/e2e/**/*.test.ts?(x)'],
  maxWorkers: 1,
};

export default config;
