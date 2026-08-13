import { test } from '@playwright/test';

const EMAIL = 'admin@mahidol.ac.th';
const PASS = 'Admin@MUMT2026';
const NEW = 'E2eAdminNew@2026';

test('find empty links on admin/registrations', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/staff/login');
  await page.getByPlaceholder('staff@mahidol.ac.th').fill(EMAIL);
  await page.getByPlaceholder('••••••••').fill(PASS);
  await page.getByRole('button', { name: 'เข้าสู่ระบบเจ้าหน้าที่' }).click();
  await page.waitForURL(/\/(staff\/change-password|staff\/checkin)/, { timeout: 15_000 }).catch(() => {});
  if (page.url().includes('/staff/change-password')) {
    await page.getByPlaceholder('รหัสที่ระบบแจกให้ครั้งแรก').fill(PASS);
    await page.getByPlaceholder('อย่างน้อย 8 ตัวอักษร').first().fill(NEW);
    await page.getByPlaceholder('พิมพ์รหัสผ่านใหม่อีกครั้ง').fill(NEW);
    await page.getByRole('button', { name: 'บันทึกรหัสผ่านใหม่' }).click();
    await page.waitForURL(/\/(staff\/checkin|admin)/, { timeout: 15_000 });
  }
  await page.goto('/admin/registrations');
  await page.waitForTimeout(600);
  const empty = await page.evaluate(() => {
    return [...document.querySelectorAll('a')]
      .filter((el) => !(el.textContent || '').trim())
      .slice(0, 15)
      .map((el) => ({ cls: (el.className || '').toString().slice(0, 60), href: el.getAttribute('href'), visible: el.getBoundingClientRect().width > 0 }));
  });
  console.log('EMPTY LINKS:', JSON.stringify(empty, null, 1));
});
