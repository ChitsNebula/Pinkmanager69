import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Authentication Flow
 * ทดสอบการ Login ของทั้งสมาชิกและสตาฟ
 *
 * ข้อมูลจริงจาก mockData.ts / store.ts:
 * - Member: ม.4/1 เลขที่ 1 → id = "40514" (กฤตยชญ์ สุขภัทรสิริ)
 * - Staff: id ที่อยู่ใน defaultControllers = ["39967", "39998", "40059"]
 * - รหัสผ่าน Staff ถูก set ใน playwright.config.ts webServer.env = "test-e2e-password"
 */

test.describe('Login — สมาชิก (นักเรียน)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('หน้า Login ต้องโหลดได้และแสดง UI ครบ', async ({ page }) => {
    // ปุ่ม login สมาชิกต้องปรากฏ
    await expect(page.getByRole('button', { name: 'เข้าสู่ระบบสมาชิก' })).toBeVisible();
    // dropdown ห้อง
    await expect(page.locator('select')).toBeVisible();
    // input เลขที่
    await expect(page.locator('input[placeholder="เช่น 15"]')).toBeVisible();
    // input รหัสประจำตัว (placeholder = "รหัสนักเรียน")
    await expect(page.locator('input[placeholder="รหัสนักเรียน"]')).toBeVisible();
  });

  test('สมาชิก ม.4/1 เลขที่ 1 ล็อกอินสำเร็จ (id="40514")', async ({ page }) => {
    // เลือกห้อง ม.4/1
    await page.locator('select').selectOption({ label: 'ม.4/1' });
    // กรอกเลขที่
    await page.locator('input[placeholder="เช่น 15"]').fill('1');
    // กรอก id จริงของ student (ไม่ใช่ student_id)
    await page.locator('input[placeholder="รหัสนักเรียน"]').fill('40514');
    // กดปุ่มเข้าสู่ระบบ
    await page.getByRole('button', { name: 'เข้าสู่ระบบสมาชิก' }).click();

    // รอให้ Navbar โหลด — ยืนยันว่า login สำเร็จ
    await expect(page.locator('header').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('header').getByText('PINK')).toBeVisible();
  });

  test('ล็อกอินด้วยรหัสผิดต้องแสดง error', async ({ page }) => {
    await page.locator('select').selectOption({ label: 'ม.4/1' });
    await page.locator('input[placeholder="เช่น 15"]').fill('1');
    await page.locator('input[placeholder="รหัสนักเรียน"]').fill('99999'); // รหัสผิด
    await page.getByRole('button', { name: 'เข้าสู่ระบบสมาชิก' }).click();

    // ต้องแสดง error message
    await expect(page.locator('text=/ไม่พบ|ไม่ถูกต้อง|ไม่ตรง|error/i')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Login — สตาฟ (ผู้ควบคุม)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('สลับแท็บไปหน้า "ผู้ควบคุม" ได้', async ({ page }) => {
    await page.locator('button:has-text("ผู้ควบคุม")').click();
    // ต้องมี input username และ password ปรากฏ
    await expect(page.locator('input[placeholder*="admin"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="123"]')).toBeVisible();
  });

  test('สตาฟล็อกอินสำเร็จด้วย id ที่อยู่ใน controllers list', async ({ page }) => {
    // สลับแท็บ
    await page.locator('button:has-text("ผู้ควบคุม")').click();

    // กรอก id ของ controller (39967 อยู่ใน defaultControllers)
    await page.locator('input[placeholder*="admin"]').fill('39967');
    // กรอกรหัสผ่านที่ตั้งไว้ใน playwright.config.ts
    await page.locator('input[placeholder*="123"]').fill('test-e2e-password');
    // กดปุ่ม login
    await page.getByRole('button', { name: 'เข้าสู่ระบบผู้ควบคุม' }).click();

    // รอ Navbar และตรวจว่า logged in
    await expect(page.locator('header').first()).toBeVisible({ timeout: 8000 });
  });

  test('สตาฟกรอกรหัสผ่านผิดต้องแสดง error', async ({ page }) => {
    await page.locator('button:has-text("ผู้ควบคุม")').click();
    await page.locator('input[placeholder*="admin"]').fill('39967');
    await page.locator('input[placeholder*="123"]').fill('wrongpassword');
    await page.getByRole('button', { name: 'เข้าสู่ระบบผู้ควบคุม' }).click();

    await expect(page.locator('text=/ไม่ถูกต้อง|ผิด|error|ไม่สำเร็จ/i')).toBeVisible({ timeout: 5000 });
  });
});
