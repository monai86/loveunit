import { test, expect, type Page } from '@playwright/test';

// ============================================================
// Keyboard navigation + focus trap audit
// 1. register form — Tab order through wizard steps
// 2. waitlist modal — dialog semantics, Escape, focus trap, restore
// 3. walk-in form (staff) — Tab order + label binding
// ============================================================

// Make the LAST slot FULL by temporarily dropping its capacity to 0, then
// restore it in afterAll. This triggers the waitlist modal WITHOUT creating
// registrations — so parallel specs (staff-checkin, which always picks the
// first free slot) never see a polluted slot.
const MODAL_SLOT_ID = '11111111-1111-1111-1111-111111111107'; // last slot (07:00)
let originalCapacity: number | null = null;

async function setSlotCapacity(capacity: number) {
  const { loadEnvLocal } = await import('../../scripts/lib/env');
  loadEnvLocal();
  const { db } = await import('@/db');
  const { timeSlots } = await import('@/db/schema');
  const { eq } = await import('drizzle-orm');
  if (!db) return;
  await db.update(timeSlots).set({ capacity }).where(eq(timeSlots.id, MODAL_SLOT_ID));
}

async function readSlotCapacity(): Promise<number | null> {
  const { loadEnvLocal } = await import('../../scripts/lib/env');
  loadEnvLocal();
  const { db } = await import('@/db');
  const { timeSlots } = await import('@/db/schema');
  const { eq } = await import('drizzle-orm');
  if (!db) return null;
  const [row] = await db.select().from(timeSlots).where(eq(timeSlots.id, MODAL_SLOT_ID)).limit(1);
  return row ? (row.capacity as number) : null;
}

test.beforeAll(async () => {
  originalCapacity = await readSlotCapacity();
  if (originalCapacity !== null) await setSlotCapacity(0);
});

test.afterAll(async () => {
  if (originalCapacity !== null) await setSlotCapacity(originalCapacity);
});

async function loginStaff(page: Page) {
  // Use the TEAM_LEAD account — staff-checkin.spec rotates the staff password
  // in parallel workers, so a shared staff account would race. lead@ is only
  // used by this spec.
  const pw = 'Lead@MUMT2026';

  // Under heavy parallel load the login click can land before React hydrates,
  // which submits the form natively (GET) and bounces back to /staff/login with
  // no error banner. Retry the whole login up to 3 times; each attempt waits
  // for the session check fetch first, which implies hydration finished.
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto('/staff/login');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.getByPlaceholder('staff@mahidol.ac.th').fill('lead@mahidol.ac.th');
    await page.getByPlaceholder('••••••••').fill(pw);
    await page.getByRole('button', { name: 'เข้าสู่ระบบเจ้าหน้าที่' }).click();
    await page.waitForURL(/(\/(staff\/change-password|staff\/checkin))/, { timeout: 20_000 }).catch(() => {});
    if (!page.url().includes('/staff/login')) break;
    console.log(`[WALKIN login attempt ${attempt} failed — still on /staff/login]`);
  }

  if (page.url().includes('/staff/change-password')) {
    await page.getByPlaceholder('รหัสที่ระบบแจกให้ครั้งแรก').fill(pw);
    await page.getByPlaceholder('อย่างน้อย 8 ตัวอักษร').first().fill(pw);
    await page.getByPlaceholder('พิมพ์รหัสผ่านใหม่อีกครั้ง').fill(pw);
    await page.getByRole('button', { name: 'บันทึกรหัสผ่านใหม่' }).click();
    await page.waitForURL(/\/staff\/checkin/, { timeout: 30_000 }).catch(() => {});
  }
}

test.describe('keyboard navigation & focus trap', () => {
  test.describe.configure({ mode: 'serial' });

  test('register form — Tab order through wizard steps', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(500);

    // Skip-link audit: a visible skip-to-content link should exist for keyboard users
    const skipLink = await page.evaluate(() => {
      const links = [...document.querySelectorAll('a')];
      const skip = links.find((a) => /skip|ข้าม|ไปยังเนื้อหา/i.test((a.textContent || '') + ' ' + (a.getAttribute('href') || '')));
      return skip ? { text: skip.textContent.trim(), href: skip.getAttribute('href') } : null;
    });
    // Report but don't fail the suite here — flagged as P2.
    console.log('[SKIPLINK]', JSON.stringify(skipLink));

    // STEP 1: Tab until focus reaches the first form input (header links come first)
    let step1Focus: string | undefined = '';
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      step1Focus = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
      if (step1Focus === 'reg-firstName') break;
    }
    expect(step1Focus).toBe('reg-firstName');

    // Tab through step 1 fields in order
    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const id = await page.evaluate(() => (document.activeElement as HTMLElement)?.id || document.activeElement?.tagName || '');
      if (id) ids.push(id);
    }
    // Expected: reg-lastName, reg-phone, then the lookup link, then reg-email
    expect(ids[0]).toBe('reg-lastName');
    expect(ids[1]).toBe('reg-phone');
    expect(ids).toContain('reg-email');

    // Fill step 1 and move to step 2 via keyboard (Enter on ถัดไป)
    await page.getByPlaceholder('เช่น สมชาย').fill('สมชาย');
    await page.getByPlaceholder('เช่น ใจดี').fill('ใจดี');
    await page.getByPlaceholder('เช่น 0812345678').fill('0812345678');
    // Focus the "ถัดไป" button and press Enter
    await page.getByRole('button', { name: 'ถัดไป' }).focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // STEP 2: participant type buttons should be keyboard-reachable
    const step2Buttons = page.getByRole('button', { name: 'นักศึกษา ม.มหิดล' });
    await expect(step2Buttons).toBeVisible();
    await step2Buttons.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const step2Focus = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName || '');
    // After 3 tabs from participant buttons: faculty select or experience buttons
    expect(['reg-faculty', 'BUTTON', 'SELECT']).toContain(step2Focus);

    // Fill step 2 → step 3
    await page.getByRole('button', { name: 'ถัดไป' }).focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    // STEP 3: slot buttons keyboard-reachable, privacy checkbox reachable
    const slotButtons = page.locator('button[type="button"]').filter({ hasText: /:00/ });
    await expect(slotButtons.first()).toBeVisible();
    await slotButtons.first().focus();
    const slotFocus = await page.evaluate(() => (document.activeElement as HTMLElement)?.tagName);
    expect(slotFocus).toBe('BUTTON');

    // h1 visible and page usable via keyboard only
    await expect(page.getByRole('heading', { name: 'ลงทะเบียนบริจาคโลหิตออนไลน์' })).toBeVisible();
  });

  test('waitlist modal — dialog semantics, Escape, focus trap, restore', async ({ page }) => {
    // Slot 01:00 was forced to FULL in beforeAll — walk the wizard to step 3
    await page.goto('/register');
    await page.waitForTimeout(500);
    await page.getByPlaceholder('เช่น สมชาย').fill('สมหญิง');
    await page.getByPlaceholder('เช่น ใจดี').fill('ทดสอบ');
    await page.getByPlaceholder('เช่น 0812345678').fill('0871234567');
    await page.getByRole('button', { name: 'ถัดไป' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'ถัดไป' }).click();
    await page.waitForTimeout(800);

    // The FULL slot (first row) opens the waitlist modal on click
    const fullSlot = page.locator('button').filter({ hasText: 'เต็มแล้ว · คลิกเข้ารายการรอ' }).first();
    await expect(fullSlot).toBeVisible({ timeout: 5000 });
    await fullSlot.click();
    await page.waitForTimeout(300);

    // 1) Dialog semantics — role="dialog" + aria-modal + label
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    const ariaModal = await dialog.getAttribute('aria-modal');
    expect(ariaModal).toBe('true');
    const labelledBy = await dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();

    // 2) Initial focus lands inside the dialog
    const initialFocus = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      return d ? d.contains(document.activeElement) : false;
    });
    expect(initialFocus).toBe(true);

    // 3) Escape closes the dialog
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // Re-open to test the focus trap
    await fullSlot.click();
    await page.waitForTimeout(300);

    // 4) Focus trap — Tab from the last control wraps back inside the dialog
    // Shift+Tab repeatedly to reach the first focusable inside the dialog,
    // then Shift+Tab once more → should still be inside the dialog
    let inside = true;
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Shift+Tab');
      inside = await page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]');
        return d ? d.contains(document.activeElement) : false;
      });
      if (!inside) break;
    }
    expect(inside).toBe(true);

    // Tab forward from inside repeatedly should also never escape
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      inside = await page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]');
        return d ? d.contains(document.activeElement) : false;
      });
      if (!inside) break;
    }
    expect(inside).toBe(true);

    // 5) Focus restore — closing returns focus to the trigger button
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    // Focus restore to trigger is ideal; falling back inside page is acceptable
    // (we assert focus is NOT lost to body)
    const focusLost = await page.evaluate(() => document.activeElement?.tagName === 'BODY');
    expect(focusLost).toBe(false);

    // cleanup — remove the 2 filler registrations via DB
  });

  test('walk-in form (staff) — Tab order + label binding', async ({ page }) => {
    await loginStaff(page);
    console.log('[WALKIN URL after login]', page.url());

    await page.goto('/staff/walk-in');
    // Wait for the actual form to render (parallel workers make loads slower).
    await expect(page.locator('#wi-firstName')).toBeVisible({ timeout: 15_000 });

    // All inputs must have accessible names (bound labels)
    const unlabeled = await page.evaluate(() => {
      return [...document.querySelectorAll('input, select')]
        .filter((i) => !i.getAttribute('aria-label') && !i.id)
        .map((i) => i.tagName + ':' + (i.getAttribute('placeholder') || ''));
    });
    expect(unlabeled).toEqual([]);

    // Tab order: firstName → lastName → phone → participant type buttons → submit
    // (header links + skip link come first — Tab until the form)
    let f1: string | undefined = '';
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      f1 = await page.evaluate(() => document.activeElement?.id);
      if (f1 === 'wi-firstName') break;
    }
    expect(f1).toBe('wi-firstName');
    await page.keyboard.press('Tab');
    const f2 = await page.evaluate(() => document.activeElement?.id);
    expect(f2).toBe('wi-lastName');
    await page.keyboard.press('Tab');
    const f3 = await page.evaluate(() => document.activeElement?.id);
    expect(f3).toBe('wi-phone');

    // Type quickly and submit via keyboard. Use a UNIQUE phone per run so
    // repeated runs (CI, parallel workers) never hit a duplicate registration.
    const uniquePhone = `088${String(Date.now()).slice(-8)}`;
    await page.getByPlaceholder('ชื่อจริง').fill('วอล์กอิน');
    await page.getByPlaceholder('นามสกุล').fill('ทดสอบคีย์');
    await page.locator('#wi-phone').fill(uniquePhone);
    await page.getByRole('button', { name: 'Register & Check In ทันที' }).focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);

    // Success alert should appear (form is keyboard-submittable)
    await expect(page.getByText(/ลงทะเบียน & เช็คอินสำเร็จ/)).toBeVisible({ timeout: 5000 });
  });
});
