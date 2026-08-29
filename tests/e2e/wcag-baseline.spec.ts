import { test, expect } from '@playwright/test';

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

  test('staff walk-in exposes the donor type picker as a keyboard-ready radio group', async ({ page, request }) => {
    const response = await request.post('/api/auth/sign-in/email', {
      data: { email: 'monai.yut@student.mahidol.edu', password: 'loveunit2026' },
    });
    expect(response.status()).toBe(200);
    const cookie = response.headers()['set-cookie']?.split(';')[0];
    expect(cookie).toBeTruthy();
    const [name, value] = cookie!.split('=');
    await page.context().addCookies([{ name, value, domain: 'localhost', path: '/' }]);

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

  test('admin destructive dialog keeps keyboard focus inside while it is open', async ({ page, request }) => {
    const response = await request.post('/api/auth/sign-in/email', {
      data: { email: 'monai.yut@student.mahidol.edu', password: 'loveunit2026' },
    });
    const cookie = response.headers()['set-cookie']?.split(';')[0];
    expect(cookie).toBeTruthy();
    const [name, value] = cookie!.split('=');
    await page.context().addCookies([{ name, value, domain: 'localhost', path: '/' }]);

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

  test('staff invitation dialog has modal semantics and labelled fields', async ({ page, request }) => {
    const response = await request.post('/api/auth/sign-in/email', {
      data: { email: 'monai.yut@student.mahidol.edu', password: 'loveunit2026' },
    });
    const cookie = response.headers()['set-cookie']?.split(';')[0];
    expect(cookie).toBeTruthy();
    const [name, value] = cookie!.split('=');
    await page.context().addCookies([{ name, value, domain: 'localhost', path: '/' }]);

    await page.goto('/mt70/staff');
    await page.getByRole('button', { name: 'เชิญ Staff' }).click();
    const dialog = page.getByRole('dialog', { name: 'เชิญ Staff ใหม่' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('อีเมล')).toBeVisible();
    await expect(dialog.getByLabel('ชื่อ-นามสกุล')).toBeVisible();
    await expect(dialog.getByLabel('ฝ่าย / ทีม')).toBeVisible();
  });

  test('staff scan opens as a non-scrolling full-screen camera workspace', async ({ page, request }) => {
    const response = await request.post('/api/auth/sign-in/email', {
      data: { email: 'monai.yut@student.mahidol.edu', password: 'loveunit2026' },
    });
    const cookie = response.headers()['set-cookie']?.split(';')[0];
    expect(cookie).toBeTruthy();
    const [name, value] = cookie!.split('=');
    await page.context().addCookies([{ name, value, domain: 'localhost', path: '/' }]);

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
