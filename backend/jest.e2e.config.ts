import type { Config } from 'jest';
import baseConfig from './jest.base.config';

const config: Config = {
  ...baseConfig,
  testMatch: ['<rootDir>/tests/e2e/**/*.spec.ts'],
  testTimeout: 30000,
};

export default config;
