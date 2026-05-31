import type { Config } from 'jest';
import baseConfig from './jest.base.config';

const config: Config = {
  ...baseConfig,
  testMatch: ['<rootDir>/tests/integration/**/*.spec.ts'],
};

export default config;
