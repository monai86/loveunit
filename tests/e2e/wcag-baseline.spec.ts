import { test, expect } from '@playwright/test';

async function loginStaff(page: import('@playwright/test').Page) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto('/staff/login');
    await page.waitForLoadState('networkidle').catch(() => {});
    if (page.url().includes('/mt70') || page.url().includes('/admin') || page.url().includes('/staff/checkin') || page.url().includes('/staff/walk-in') || page.url().includes('/staff/overview')) break;
    const emailInput = page.locator('#staff-email');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill('monai.yut@student.mahidol.edu');
      await page.locator('#staff-password').fill('loveunit2026');
      await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).click();
      await page.waitForURL(/\/(staff\/change-password|staff\/checkin|admin|mt70|staff\/overview|staff\/walk-in)/, { timeout: 15_000 }).catch(() => {});
    }
    if (!page.url().includes('/staff/login')) break;
    await page.waitForTimeout(300);
  }
}

test.describe('WCAG 2.2 AA baseline', () => {
  test('public pages allow browser zoom and provide 44px mobile navigation targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).not.toMatch(/user-scalable\s*=\s*(?:no|0)/i);
    expect(viewport).not.toMatch(/maximum-scale\s*=\s*1(?:\.0+)?/i);

    const menuBox = await page.getByRole('button', { name: 'เปิดเมนูหลัก' }).boundingBox();
    expect(menuBox?.width).toBeGreaterThanOrEqual(44);
    expect(menuBox?.height).toBeGreaterThanOrEqual(44);

    const mobileNavBoxes = await page.locator('nav[aria-label="Mobile Navigation"] a').evaluateAll((items) =>
      items.map((item) => {
        const box = item.getBoundingClientRect();
        return { width: box.width, height: box.height };
      }),
    );
    expect(mobileNavBoxes.every((box) => box.width >= 44 && box.height >= 44)).toBe(true);
  });

  test('staff walk-in exposes the donor type picker as a keyboard-ready radio group', async ({ page }) => {
    await loginStaff(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/staff/walk-in');
    const donorTypes = page.getByRole('group', { name: 'ประเภทผู้บริจาค' });
    await expect(donorTypes).toBeVisible();
    const radios = donorTypes.getByRole('radio');
    await expect(radios).toHaveCount(3);
    await expect(radios.first()).toBeChecked();
    const boxes = await donorTypes.locator('label').evaluateAll((items) => items.map((item) => item.getBoundingClientRect().height));
    expect(boxes.every((height) => height >= 44)).toBe(true);
  });

  test('admin destructive dialog keeps keyboard focus inside while it is open', async ({ page }) => {
    await loginStaff(page);

    await page.goto('/mt70/registrations');
    await page.getByRole('button', { name: 'เริ่มเลข Registration Code ใหม่' }).click();
    const dialog = page.getByRole('dialog', { name: 'เริ่มเลข Registration Code ใหม่' });
    await expect(dialog).toBeVisible();

    for (let index = 0; index < 8; index += 1) {
      await page.keyboard.press('Tab');
      const focusInsideDialog = await dialog.evaluate((element) => element.contains(document.activeElement));
      expect(focusInsideDialog).toBe(true);
    }
  });

  test('staff invitation dialog has modal semantics and labelled fields', async ({ page }) => {
    await loginStaff(page);

    await page.goto('/mt70/staff');
    await page.getByRole('button', { name: 'เชิญ Staff' }).click();
    const dialog = page.getByRole('dialog', { name: 'เชิญ Staff ใหม่' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel(/Email|อีเมล/i)).toBeVisible();
    await expect(dialog.getByLabel(/Username|ชื่อ-นามสกุล/i)).toBeVisible();
    await expect(dialog.getByLabel(/ฝ่าย \/ ทีม/i)).toBeVisible();
  });

  test('staff scan opens as a non-scrolling full-screen camera workspace', async ({ page }) => {
    await loginStaff(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/staff/checkin');

    const cameraWorkspace = page.getByTestId('fullscreen-scanner');
    await expect(cameraWorkspace).toBeVisible();
    const viewportSize = page.viewportSize();
    const cameraBox = await cameraWorkspace.boundingBox();
    expect(cameraBox?.height).toBeGreaterThanOrEqual(viewportSize!.height);
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true);
    await expect(page.getByRole('heading', { name: 'ค้นหาผู้บริจาค' })).toHaveCount(0);
  });
});
