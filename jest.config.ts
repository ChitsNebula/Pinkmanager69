import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // ชี้ไปที่ Next.js app root เพื่อให้ next/jest โหลด next.config.ts และ .env files
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // รัน setup files หลังจาก test framework ถูก install (จึงใช้ @testing-library matchers ได้)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/tests/', // Playwright E2E อยู่ที่นี่ — ไม่ใช้ Jest
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/mockData.ts',
  ],
};

export default createJestConfig(config);
