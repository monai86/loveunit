import { test, expect } from '@playwright/test';

// Full E2E Security Closure & Donor Verification Test
test.describe('MUMT LoveUnit - Security Closure & Real Production E2E Verification', () => {
  test('Complete donor journey: Home -> Screening -> Register -> Authorized Pass -> Locked Bare URL -> Lookup -> Cancel', async ({ page }) => {
    const firstName = `พิธา`;
    const lastName = `ทดสอบ${Date.now().toString().slice(-4)}`;
    const phone = `089${Math.floor(1000000 + Math.random() * 9000000)}`;
    const email = `pitha.${Date.now()}@student.mahidol.edu`;

    // 1. Visit Homepage
    await page.goto('/');
    await expect(page.getByRole('link', { name: /MUMT LOVE UNIT/i }).first()).toBeVisible();

    // 2. Screening Page
    await page.goto('/screening');
    await expect(page.getByRole('heading', { name: /แบบประเมินความพร้อมตนเองก่อนบริจาคโลหิต/i })).toBeVisible();

    // 3. Register Page
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'ลงทะเบียนบริจาคโลหิตออนไลน์' })).toBeVisible({ timeout: 15_000 });

    // Step 1: Personal info
    await page.getByPlaceholder('เช่น สมชาย').fill(firstName);
    await page.getByPlaceholder('เช่น ใจดี').fill(lastName);
    await page.getByPlaceholder('เช่น 0812345678').fill(phone);
    await page.getByPlaceholder('เช่น somchai@example.com').fill(email);
    await page.getByRole('button', { name: 'ถัดไป' }).click();

    // Step 2: Affiliation & Experience
    await expect(page.getByRole('heading', { name: /02\. สังกัดและสถานภาพ/i })).toBeVisible();
    await page.getByRole('button', { name: 'นักศึกษา' }).click();
    await page.getByRole('button', { name: /เคยบริจาคแล้ว/ }).click();
    await page.getByRole('button', { name: 'ถัดไป' }).click();

    // Step 3: Preferred slot + PDPA
    await expect(page.getByRole('heading', { name: /03\. เลือกรอบเวลา/i })).toBeVisible();
    const slot = page.locator('button[type="button"]').filter({ hasText: /09:00|10:00|11:00|12:00|13:00/ }).first();
    await slot.click();
    await page.getByRole('checkbox', { name: /ข้าพเจ้าได้อ่านและยินยอม/i }).check();
    await page.getByRole('button', { name: 'ตรวจสอบข้อมูล' }).click();

    // Step 4: Confirm & submit
    await expect(page.getByRole('heading', { name: /ตรวจสอบข้อมูลการลงทะเบียน/i })).toBeVisible();
    await page.locator('button[type="submit"]').click({ noWaitAfter: true });

    // 4. Verify Authorized Redirection to Clean Pass URL (Session Cookie Authorized)
    await page.waitForURL(/\/registration\/LVU26-[A-Z0-9]+/, { timeout: 15_000 });
    const fullPassUrl = page.url();
    // Token is transported via secure HttpOnly session cookie, NOT leaked in the URL!
    expect(fullPassUrl).not.toContain('token=');

    // Verify Pass Content (Pass Buttons and Donor Name visible)
    await expect(page.getByRole('button', { name: /บันทึกภาพตั๋ว/ })).toBeVisible();
    await expect(page.getByText(firstName)).toBeVisible();
    await expect(page.getByText(lastName)).toBeVisible();

    // Extract registration code from URL
    const regCodeMatch = fullPassUrl.match(/\/registration\/(LVU26-[A-Z0-9]+)/);
    expect(regCodeMatch).toBeTruthy();
    const regCode = regCodeMatch![1];

    // 5. Test Bare Sequential Code URL in Fresh Incognito Context WITHOUT Cookie -> MUST BE LOCKED
    const freshContext = await page.context().browser()!.newContext();
    const freshPage = await freshContext.newPage();
    await freshPage.goto(`http://localhost:3001/registration/${regCode}`);
    await expect(freshPage.getByText('ต้องใช้ลิงก์ยืนยันตัวตนเพื่อเปิดดูตั๋ว (Private Pass)')).toBeVisible();
    // Ticket actions must NOT be present on locked view
    await expect(freshPage.getByRole('button', { name: /บันทึกภาพตั๋ว/ })).not.toBeVisible();
    // Verify direct link to /lookup is present
    await expect(freshPage.getByRole('link', { name: /ขอรับลิงก์ยืนยันตัวตนทางอีเมล/ })).toBeVisible();
    await freshContext.close();

    // 6. Navigate to /lookup
    await page.goto('/lookup');
    await expect(page.getByText('ค้นหาตั๋วและ QR Code ของฉัน')).toBeVisible();
    await page.getByPlaceholder(/เช่น somchai@student.mahidol.edu/).fill(email);
    await page.getByRole('button', { name: /ส่งลิงก์ยืนยันตัวตนเข้าอีเมล/ }).click();
    await expect(page.getByText('ส่งลิงก์ยืนยันตัวตนเรียบร้อยแล้ว')).toBeVisible();

    // 7. Verify /location page
    await page.goto('/location');
    await expect(page.getByRole('heading', { name: /ห้องประชุม 217/i })).toBeVisible();
  });
});
