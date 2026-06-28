import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Dashboard / หน้าหลัก
 * ทดสอบหน้าหลักหลัง login สำเร็จ
 */

// Helper: login เป็นสมาชิกทั่วไป ม.4/1 เลขที่ 1
async function loginAsMember(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('select').selectOption({ label: 'ม.4/1' });
  await page.locator('input[placeholder="เช่น 15"]').fill('1');
  // id จริงของ กฤตยชญ์ สุขภัทรสิริ ม.4/1 เลขที่ 1 = "40514"
  await page.locator('input[placeholder="รหัสนักเรียน"]').fill('40514');
  await page.getByRole('button', { name: 'เข้าสู่ระบบสมาชิก' }).click();
  await expect(page.locator('header').first()).toBeVisible({ timeout: 8000 });
}

test.describe('Dashboard — Navbar', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test('Navbar มีโลโก้ PINK69', async ({ page }) => {
    await expect(page.locator('header').getByText('PINK')).toBeVisible();
  });

  test('มีปุ่ม "หน้าหลัก" และ "ประกาศ" บน Navbar', async ({ page }) => {
    await expect(page.locator('nav button:has-text("หน้าหลัก")')).toBeVisible();
    await expect(page.locator('nav button:has-text("ประกาศ")')).toBeVisible();
  });

  test('ซ่อนปุ่ม "แผงผู้ควบคุม" สำหรับสมาชิกทั่วไป', async ({ page }) => {
    await expect(page.locator('button:has-text("แผงผู้ควบคุม")')).not.toBeVisible();
  });

  test('แสดงปุ่มออกจากระบบ', async ({ page }) => {
    await expect(page.locator('button[title="ออกจากระบบ"]')).toBeVisible();
  });
});

test.describe('Dashboard — Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test('กดแท็บ "ประกาศ" แล้วหน้าเปลี่ยนได้', async ({ page }) => {
    await page.locator('nav button:has-text("ประกาศ")').click();
    // ตรวจว่ามี content ของแท็บประกาศ
    await expect(page.locator('text=/ประกาศ|Announcement/i').first()).toBeVisible({ timeout: 3000 });
  });

  test('กดแท็บ "แจ้งปัญหา" แล้วหน้าเปลี่ยนได้', async ({ page }) => {
    await page.locator('nav button:has-text("แจ้งปัญหา")').click();
    await expect(page.locator('text=/แจ้ง|ปัญหา|Report/i').first()).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Dashboard — Logout', () => {
  test('กดออกจากระบบแล้วกลับมาที่หน้า Login', async ({ page }) => {
    await loginAsMember(page);
    await page.locator('button[title="ออกจากระบบ"]').click();
    // ต้องกลับไปหน้า login — ปุ่ม "เข้าสู่ระบบสมาชิก" ต้องปรากฏอีกครั้ง
    await expect(page.getByRole('button', { name: 'เข้าสู่ระบบสมาชิก' })).toBeVisible({ timeout: 5000 });
  });
});
