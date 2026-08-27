import { test } from '@playwright/test';

const EMAIL = 'admin@mahidol.ac.th';
const PASS = 'Admin@MUMT2026';
const NEW = 'E2eAdminNew@2026';

test('find empty links on admin/registrations', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/staff/login');
  await page.waitForLoadState('networkidle').catch(() => {});
  if (!page.url().includes('/mt70') && !page.url().includes('/admin') && !page.url().includes('/staff/change-password')) {
    const emailInput = page.locator('#staff-email');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill(EMAIL);
      await page.locator('#staff-password').fill(PASS);
      await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).click();
      try {
        await page.waitForURL(/\/(staff\/change-password|staff\/checkin|admin|mt70)/, { timeout: 15_000 });
      } catch {
        if (page.url().includes('/staff/login')) {
          await page.locator('#staff-password').fill(NEW);
          await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).click();
          await page.waitForURL(/\/(staff\/change-password|staff\/checkin|admin|mt70)/, { timeout: 15_000 }).catch(() => {});
        }
      }
    }
  }
  if (page.url().includes('/staff/change-password')) {
    await page.getByPlaceholder('รหัสที่ระบบแจกให้ครั้งแรก').fill(PASS);
    await page.getByPlaceholder('อย่างน้อย 8 ตัวอักษร').first().fill(NEW);
    await page.getByPlaceholder('พิมพ์รหัสผ่านใหม่อีกครั้ง').fill(NEW);
    await page.getByRole('button', { name: 'บันทึกรหัสผ่านใหม่' }).click();
    await page.waitForURL(/\/(staff\/checkin|admin|mt70)/, { timeout: 15_000 });
  }
  await page.goto('/mt70/registrations');
  await page.waitForTimeout(600);
  const empty = await page.evaluate(() => {
    return [...document.querySelectorAll('a')]
      .filter((el) => !(el.textContent || '').trim())
      .slice(0, 15)
      .map((el) => ({ cls: (el.className || '').toString().slice(0, 60), href: el.getAttribute('href'), visible: el.getBoundingClientRect().width > 0 }));
  });
  console.log('EMPTY LINKS:', JSON.stringify(empty, null, 1));
});
