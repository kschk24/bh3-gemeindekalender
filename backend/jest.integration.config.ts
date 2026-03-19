import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.integration.test.ts'],
  // No moduleNameMapper — uses real PrismaClient against actual DB
  setupFiles: ['<rootDir>/src/test/setup.ts'],
  testTimeout: 30000,
};

export default config;
