import type { Config } from 'jest';
import baseConfig from './jest.base.config';

const config: Config = {
  ...baseConfig,
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts?(x)', '<rootDir>/src/**/*.unit.test.ts?(x)'],
};

export default config;
