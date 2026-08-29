import { test, expect, type APIRequestContext } from '@playwright/test';

const ADMIN_EMAIL = 'monai.yut@student.mahidol.edu';
const ADMIN_PASS = 'loveunit2026';
const NEW_PASS = 'E2eAdminNew@2026';

test.describe.configure({ mode: 'serial' });

async function signIn(request: APIRequestContext, email: string, password: string): Promise<string | null> {
  const res = await request.post('/api/auth/sign-in/email', { data: { email, password } });
  if (res.status() !== 200) return null;
  return res.headers()['set-cookie']?.split(';')[0] || null;
}

async function login(page: import('@playwright/test').Page) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto('/staff/login');
    await page.waitForLoadState('networkidle').catch(() => {});
    if (page.url().includes('/mt70') || page.url().includes('/admin') || page.url().includes('/staff/change-password')) break;
    const emailInput = page.locator('#staff-email');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill(ADMIN_EMAIL);
      await page.locator('#staff-password').fill(ADMIN_PASS);
      await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).click();
      await page.waitForURL(/\/(staff\/change-password|staff\/checkin|admin|mt70)/, { timeout: 15_000 }).catch(() => {});
    }
    if (!page.url().includes('/staff/login')) break;
    await page.waitForTimeout(300);
  }
  await expect(page).not.toHaveURL(/\/staff\/login$/);
  if (page.url().includes('/staff/change-password')) {
    await page.getByPlaceholder('รหัสที่ระบบแจกให้ครั้งแรก').fill(ADMIN_PASS);
    await page.getByPlaceholder('อย่างน้อย 8 ตัวอักษร').first().fill(NEW_PASS);
    await page.getByPlaceholder('พิมพ์รหัสผ่านใหม่อีกครั้ง').fill(NEW_PASS);
    await page.getByRole('button', { name: 'บันทึกรหัสผ่านใหม่' }).click();
    await page.waitForURL(/\/(staff\/checkin|admin|mt70)/, { timeout: 15_000 });
  }
}

async function auditPage(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const res: Record<string, unknown> = {};
    res.unnamedButtons = [...document.querySelectorAll('button')]
      .filter((b) => !(b.textContent || '').trim() && !b.getAttribute('aria-label'))
      .map((b) => b.outerHTML.slice(0, 70));
    res.missingAlt = [...document.images].filter((i) => !i.hasAttribute('alt') || i.alt === '').map((i) => i.src.split('/').pop());
    res.unlabeledInputs = [...document.querySelectorAll('input,select')]
      .filter((i) => !i.getAttribute('aria-label') && !i.id)
      .map((i) => i.getAttribute('placeholder') || i.tagName);
    res.headingGaps = (() => {
      const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => +h.tagName[1]);
      return heads.filter((h, i) => i > 0 && h - heads[i - 1] > 1).length;
    })();
    res.microText = [...document.querySelectorAll('body *')]
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) <= 10 && el.textContent.trim().length > 0)
      .map((el) => el.textContent.trim().slice(0, 22));
    res.hScroll = document.body.scrollWidth > window.innerWidth + 1;
    res.emoji = [...document.querySelectorAll('body *')].filter(
      (el) => el.children.length === 0 && /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(el.textContent)
    ).length;
    res.smallTargets = [...document.querySelectorAll('a,button')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && r.height < 44;
      })
      .slice(0, 12)
      .map((el) => ({ tag: el.tagName, h: Math.round(el.getBoundingClientRect().height), text: (el.textContent || '').trim().slice(0, 30) }));

    const contrastIssues: Array<{ text: string; ratio: string; fs: string; bold: boolean; cls: string }> = [];
    const els = [...document.querySelectorAll('main p, main span, main a, main li, main label, main h1, main h2, main h3, main h4, main button, main td, main th')];
    const seen = new Set<string>();
    for (const el of els) {
      const text = (el.textContent || '').trim();
      if (text.length < 3 || seen.has(text)) continue;
      seen.add(text);
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight) >= 700;
      const isLarge = fs >= 18 || (bold && fs >= 14);
      const threshold = isLarge ? 3 : 4.5;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const x = Math.min(r.left + r.width / 2, window.innerWidth - 5);
      const y = Math.min(r.top + Math.min(r.height / 2, 20), window.innerHeight - 5);
      if (y < 0 || x < 0) continue;
      const el2 = document.elementFromPoint(x, y);
      if (!el2) continue;
      const bg = getComputedStyle(el2).backgroundColor;
      const fg = cs.color;
      if (!bg.startsWith('rgb') || bg === 'rgba(0, 0, 0, 0)') continue;
      const lum = (c: string) => {
        const [rr, gg, bb] = c.match(/\d+/g)!.slice(0, 3).map(Number);
        const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
        return 0.2126 * f(rr) + 0.7152 * f(gg) + 0.0722 * f(bb);
      };
      const l1 = lum(fg), l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      if (ratio < threshold - 0.1) {
        contrastIssues.push({ text: text.slice(0, 40), ratio: ratio.toFixed(2), fs: fs.toFixed(0) + 'px', bold, cls: (el.className || '').toString().slice(0, 40) });
      }
    }
    res.contrastIssues = contrastIssues.slice(0, 20);
    return res;
  });
}

async function createRegistrationForAdminAction(request: APIRequestContext) {
  const slotsResponse = await request.get('/api/events/mumt-2026/slots');
  expect(slotsResponse.status()).toBe(200);
  const slotsBody = await slotsResponse.json();
  const slot = (slotsBody.slots as Array<{ id: string; capacity?: number; bookedCount?: number }>).find(
    (candidate) => (candidate.capacity ?? 0) > (candidate.bookedCount ?? 0),
  );
  expect(slot, 'an available E2E slot is required for admin action tests').toBeTruthy();

  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const registrationResponse = await request.post('/api/events/mumt-2026/register', {
    data: {
      firstName: 'อีทูอี',
      lastName: `แอดมิน${suffix}`,
      phone: `089${suffix.slice(-7).padStart(7, '0')}`,
      email: '',
      participantType: 'GENERAL_PUBLIC',
      faculty: '',
      academicYear: '',
      donationExperience: 'FIRST_TIME',
      slotId: slot!.id,
      privacyAccepted: true,
    },
  });
  expect(registrationResponse.status(), await registrationResponse.text()).toBe(200);
  const registrationBody = await registrationResponse.json();
  return registrationBody.registration.registrationCode ?? registrationBody.registration.registration_code;
}

test('audit admin registrations', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await login(page);
  await expect(page.getByRole('link', { name: /จัดการ Staff/ })).toBeVisible();
  await page.goto('/mt70/registrations');
  await page.waitForTimeout(600);
  const out = await auditPage(page);
  console.log('\n[mt70/registrations]', JSON.stringify(out, null, 1));
});

test('admin donor edit uses an accessible in-page dialog', async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await login(page);
  const registrationCode = await createRegistrationForAdminAction(request);
  await page.goto('/mt70/registrations');
  const row = page.getByRole('row', { name: new RegExp(registrationCode) });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: /แก้ไข/ }).click();
  const dialog = page.getByRole('dialog', { name: /แก้ไขข้อมูลผู้ลงทะเบียน/ });
  await expect(dialog).toBeVisible();
  await expect(page.locator('#edit-first-name')).toBeVisible();
  await expect(page.locator('#edit-last-name')).toBeVisible();
  await expect(page.locator('#edit-phone')).toBeVisible();
  await expect(page.locator('#edit-email')).toBeVisible();
  await page.getByRole('button', { name: 'ยกเลิก' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('admin donor deletion uses an in-page confirmation dialog', async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await login(page);
  const registrationCode = await createRegistrationForAdminAction(request);
  await page.goto('/mt70/registrations');
  const row = page.getByRole('row', { name: new RegExp(registrationCode) });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: /ลบ/ }).click();
  const dialog = page.getByRole('dialog', { name: /ยืนยันการลบข้อมูลผู้ลงทะเบียน/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/การลบไม่สามารถกู้คืนได้/)).toBeVisible();
  await dialog.getByRole('button', { name: 'ยกเลิก' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('super admin can find the registration code reset control on registrations', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await login(page);
  await page.goto('/mt70/registrations');
  await expect(page.getByRole('button', { name: 'เริ่มเลข Registration Code ใหม่' })).toBeVisible();
});

test('registration code reset uses an in-page safety dialog', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await login(page);
  await page.goto('/mt70/registrations');
  await page.getByRole('button', { name: 'เริ่มเลข Registration Code ใหม่' }).click();
  const dialog = page.getByRole('dialog', { name: 'เริ่มเลข Registration Code ใหม่' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/การดำเนินการนี้จะล้างข้อมูลผู้ลงทะเบียนและ Waitlist/)).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'ยืนยันและเริ่มเลขใหม่' })).toBeDisabled();
});

test('admin header actions share a balanced height and baseline', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await login(page);
  await page.goto('/mt70');
  const actions = [
    page.getByRole('link', { name: 'จุดสแกน QR' }),
    page.getByRole('button', { name: 'ออกจากระบบ' }),
  ];
  const boxes = await Promise.all(actions.map((locator) => locator.boundingBox()));
  expect(boxes.every(Boolean)).toBe(true);
  const heights = boxes.map((box) => box?.height || 0);
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(2);
});

test('admin header presents the current account as one compact control', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await login(page);
  await page.goto('/mt70');
  const account = page.getByLabel(/บัญชีผู้ใช้/);
  await expect(account).toBeVisible();
  const accountBox = await account.boundingBox();
  const logoutBox = await page.getByRole('button', { name: 'ออกจากระบบ' }).boundingBox();
  expect(accountBox?.height).toBe(logoutBox?.height);
});

test('retired queue URL returns staff to scan workspace', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await login(page);
  await page.goto('/staff/queue');
  await expect(page).toHaveURL(/\/staff\/checkin$/);
  await expect(page.getByRole('heading', { name: 'สแกน QR ผู้บริจาค' })).toBeVisible();
});

test('audit admin content', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await login(page);
  await page.goto('/mt70/content');
  await page.waitForTimeout(600);
  const out = await auditPage(page);
  console.log('\n[mt70/content]', JSON.stringify(out, null, 1));
});

test.afterAll(async ({ request }) => {
  const cookie = await signIn(request, ADMIN_EMAIL, NEW_PASS);
  if (cookie) {
    await request.post('/api/auth/complete-password-change', {
      headers: { cookie },
      data: { currentPassword: NEW_PASS, newPassword: ADMIN_PASS },
    });
  }
});
