import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Config
 * ดู: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* รันแต่ละ test ใน parallel */
  fullyParallel: true,
  /* ถ้า CI ให้ fail เลยถ้ามี test.only หลงอยู่ */
  forbidOnly: !!process.env.CI,
  /* จำนวน retry บน CI */
  retries: process.env.CI ? 2 : 0,
  /* จำนวน worker */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    /* URL หลักสำหรับ E2E */
    baseURL: 'http://localhost:3000',
    /* เก็บ trace เมื่อ retry ครั้งแรก */
    trace: 'on-first-retry',
    /* Screenshot เมื่อ fail */
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* เริ่ม dev server ก่อนรัน E2E */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      // ตั้ง STAFF_PASSWORD สำหรับ E2E test environment
      STAFF_PASSWORD: process.env.STAFF_PASSWORD || 'test-e2e-password',
    },
  },
});
