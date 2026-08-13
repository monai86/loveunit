import { test, expect } from '@playwright/test';

test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'เติมรักให้เต็ม UNIT ต่อชีวิตด้วยโลหิตคุณ', exact: true })).toBeVisible();
  // The CTA appears in both the nav and the hero; assert the hero one.
  await expect(page.locator('main').getByRole('link', { name: 'ลงทะเบียนบริจาคโลหิต' }).first()).toBeVisible();
});
