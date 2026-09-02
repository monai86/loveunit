import { test, expect } from '@playwright/test';

// Journey A: Register → Confirmation → QR pass.
// Runs against the dev server (memory backend for business data in dev).
test('donor can register online and reach the QR pass', async ({ page }) => {
  const firstName = `เอ็มที`;
  const lastName = `ทดสอบ${Date.now().toString().slice(-5)}`;
  const phone = `089${Math.floor(1000000 + Math.random() * 9000000)}`;

  await page.goto('/register');

  // ---- Step 1: personal info ----
  await expect(page.getByRole('heading', { name: 'ลงทะเบียนบริจาคโลหิตออนไลน์' })).toBeVisible();
  await page.getByPlaceholder('เช่น สมชาย').fill(firstName);
  await page.getByPlaceholder('เช่น ใจดี').fill(lastName);
  await page.getByPlaceholder('เช่น 0812345678').fill(phone);
  await page.getByPlaceholder('เช่น somchai@example.com').fill(`e2e.${Date.now()}@test.local`);
  await page.getByRole('button', { name: 'ถัดไป' }).click();

  // ---- Step 2: affiliation + donation experience ----
  await expect(page.getByRole('heading', { name: /02\. สังกัดและสถานภาพ/ })).toBeVisible();
  await page.getByRole('button', { name: 'บุคคลทั่วไป' }).click();
  await page.getByRole('button', { name: /เคยบริจาคแล้ว/ }).click();
  await page.getByRole('button', { name: 'ถัดไป' }).click();

  // ---- Step 3: pick a preferred arrival slot + accept privacy ----
  await expect(page.getByRole('heading', { name: /03\. เลือกรอบเวลา/ })).toBeVisible();
  // Click an available preferred arrival slot (10:00+).
  const slot = page.locator('button[type="button"]').filter({ hasText: /10:00|11:00|12:00|13:00/ }).first();
  await slot.click();
  await page.getByRole('checkbox', { name: /ข้าพเจ้าได้อ่านและยินยอม/i }).check();

  // Move to Step 4: Review
  await page.getByRole('button', { name: 'ตรวจสอบข้อมูล' }).click();

  // ---- Step 4: Review details and confirm ----
  await expect(page.getByText('ตรวจสอบข้อมูลการลงทะเบียน')).toBeVisible();
  
  await page.locator('button[type="submit"]').click({ noWaitAfter: true });
  await page.waitForURL(/\/registration\//, { timeout: 15_000 });

  expect(page.url()).toMatch(/\/registration\/LVU26-/);
  // Clean URL: bearer token is transported via secure HttpOnly cookie, NOT in URL
  expect(page.url()).not.toContain('token=');

  // Ticket Pass actions rendered + donor name shown.
  await expect(page.getByRole('button', { name: /บันทึกภาพตั๋ว/ })).toBeVisible();
  await expect(page.getByText(firstName)).toBeVisible();
  await expect(page.getByText(lastName)).toBeVisible();

  // Clean up created donor so test data does not linger in DB
  const match = page.url().match(/\/registration\/(LVU26-[0-9A-Z]+)/);
  if (match && match[1]) {
    await page.request.post('/api/registrations/cancel', {
      data: { registrationCode: match[1], reason: 'E2E test teardown cleanup' },
    });
  }
});
