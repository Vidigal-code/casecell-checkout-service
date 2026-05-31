import type { Config } from 'jest';
import baseConfig from './jest.base.config';

const config: Config = {
  ...baseConfig,
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts?(x)'],
};

export default config;
