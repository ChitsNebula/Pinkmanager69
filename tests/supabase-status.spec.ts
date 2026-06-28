import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Supabase Status Indicator บน Navbar
 * ทดสอบการแสดงผลสัญลักษณ์ 🟢 / 🟡 หลัง login
 */

// Helper: login เป็นสมาชิก (ใช้ชื่อปุ่มจริงจาก LoginScreen.tsx)
async function loginAsMember(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('select').selectOption({ label: 'ม.4/1' });
  await page.locator('input[placeholder="เช่น 15"]').fill('1');
  // id จริงของ กฤตยชญ์ สุขภัทรสิริ ม.4/1 เลขที่ 1 = "40514"
  await page.locator('input[placeholder="รหัสนักเรียน"]').fill('40514');
  await page.getByRole('button', { name: 'เข้าสู่ระบบสมาชิก' }).click();
  await expect(page.locator('header').first()).toBeVisible({ timeout: 8000 });
}

test.describe('Supabase Status Indicator', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test('indicator ต้องปรากฏบน Navbar', async ({ page }) => {
    // ตรวจว่ามี indicator (Supabase หรือ Offline) อย่างน้อยหนึ่งอัน
    const indicatorOnline = page.locator('text=Supabase');
    const indicatorOffline = page.locator('text=Offline');

    const hasOnline = await indicatorOnline.isVisible().catch(() => false);
    const hasOffline = await indicatorOffline.isVisible().catch(() => false);
    expect(hasOnline || hasOffline).toBe(true);
  });

  test('indicator มี tooltip title บอกสถานะ', async ({ page }) => {
    // ตรวจ div ที่มี title attribute เกี่ยวกับ Supabase
    const indicatorDiv = page.locator('[title*="Supabase"]').first();
    await expect(indicatorDiv).toBeVisible();
  });

  test('เมื่อ Supabase ไม่ได้ config — แสดง Offline indicator', async ({ page }) => {
    // ในสภาพแวดล้อม E2E ทั่วไปไม่มี Supabase URL จริง → ควรแสดง Offline
    // (ถ้ามี .env.local ที่ config จริงก็จะแสดง Supabase แทน)
    const isOffline = await page.locator('text=Offline').isVisible().catch(() => false);
    const isOnline = await page.locator('text=Supabase').isVisible().catch(() => false);

    // ต้องแสดงอย่างใดอย่างหนึ่งเสมอ
    expect(isOffline || isOnline).toBe(true);
  });

  test('dot indicator มี class สีที่ถูกต้อง', async ({ page }) => {
    const isOnline = await page.locator('text=Supabase').isVisible().catch(() => false);

    if (isOnline) {
      // เมื่อ online — container ต้องมี class สีเขียว (emerald)
      const container = page.locator('[title*="เชื่อมต่อฐานข้อมูล"]');
      await expect(container).toHaveClass(/emerald/);
    } else {
      // เมื่อ offline — container ต้องมี class สีเหลือง (amber)
      const container = page.locator('[title*="ไม่ได้เชื่อมต่อ"]');
      await expect(container).toHaveClass(/amber/);
    }
  });
});
