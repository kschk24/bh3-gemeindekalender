import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '@prisma/client': '<rootDir>/src/test/prisma.mock.ts',
  },
  setupFiles: ['<rootDir>/src/test/setup.ts'],
};

export default config;
