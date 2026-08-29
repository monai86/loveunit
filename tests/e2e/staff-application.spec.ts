import { test, expect } from '@playwright/test';

test('staff application page does not show the operational staff header', async ({ page }) => {
  await page.goto('/staff/apply');
  await expect(page.getByRole('heading', { name: 'สมัครเป็น Staff' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'สแกน QR' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'ลงทะเบียน Walk-in' })).toHaveCount(0);
});
