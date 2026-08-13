import { test, type APIRequestContext } from '@playwright/test';

const ADMIN_EMAIL = 'admin@mahidol.ac.th';
const ADMIN_PASS = 'Admin@MUMT2026';
const NEW_PASS = 'E2eAdminNew@2026';

test.describe.configure({ mode: 'serial' });

async function signIn(request: APIRequestContext, email: string, password: string): Promise<string | null> {
  const res = await request.post('/api/auth/sign-in/email', { data: { email, password } });
  if (res.status() !== 200) return null;
  return res.headers()['set-cookie']?.split(';')[0] || null;
}

async function login(page: import('@playwright/test').Page) {
  await page.goto('/staff/login');
  await page.getByPlaceholder('staff@mahidol.ac.th').fill(ADMIN_EMAIL);
  await page.getByPlaceholder('••••••••').fill(ADMIN_PASS);
  await page.getByRole('button', { name: 'เข้าสู่ระบบเจ้าหน้าที่' }).click();
  await page.waitForURL(/\/(staff\/change-password|staff\/checkin)/, { timeout: 15_000 }).catch(() => {});
  if (page.url().includes('/staff/change-password')) {
    await page.getByPlaceholder('รหัสที่ระบบแจกให้ครั้งแรก').fill(ADMIN_PASS);
    await page.getByPlaceholder('อย่างน้อย 8 ตัวอักษร').first().fill(NEW_PASS);
    await page.getByPlaceholder('พิมพ์รหัสผ่านใหม่อีกครั้ง').fill(NEW_PASS);
    await page.getByRole('button', { name: 'บันทึกรหัสผ่านใหม่' }).click();
    await page.waitForURL(/\/(staff\/checkin|admin)/, { timeout: 15_000 });
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

test('audit admin registrations', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await login(page);
  await page.goto('/admin/registrations');
  await page.waitForTimeout(600);
  const out = await auditPage(page);
  console.log('\n[admin/registrations]', JSON.stringify(out, null, 1));
});

test('audit admin content', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await login(page);
  await page.goto('/admin/content');
  await page.waitForTimeout(600);
  const out = await auditPage(page);
  console.log('\n[admin/content]', JSON.stringify(out, null, 1));
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
