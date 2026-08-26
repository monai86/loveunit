import { test, expect, type APIRequestContext } from '@playwright/test';

// Journey B: Staff login → (first-login forced password change) → search → check-in.
//
// Runs against the production server (next start) which uses the real Neon DB:
// the seeded staff account exists there, and business data lives in Neon too.
// The seeded account may have mustChangePassword=true (fresh seed) or false
// (after a previous run). This spec handles both, then restores the account's
// password so it can run again.

const STAFF_EMAIL = 'staff@mahidol.ac.th';
const STAFF_PASS = 'Staff@MUMT2026';
const NEW_PASS = 'E2eNewPass@2026';

test.describe.configure({ mode: 'serial' });

let donorCode = '';

async function getFirstFreeSlot(request: APIRequestContext): Promise<string> {
  const res = await request.get('/api/events/mumt-2026/slots');
  expect(res.status()).toBe(200);
  const body = await res.json();
  // The API returns { capacity, bookedCount } — compute remaining ourselves
  // instead of trusting a field that the response never carries.
  const slots: Array<{ id: string; capacity?: number; bookedCount?: number }> = body.slots || [];
  const free = slots.find((s) => (s.capacity ?? 0) - (s.bookedCount ?? 0) > 0);
  expect(free, 'expected at least one free slot for the E2E test').toBeTruthy();
  return free!.id;
}

async function signIn(request: APIRequestContext, email: string, password: string): Promise<string | null> {
  const res = await request.post('/api/auth/sign-in/email', {
    data: { email, password },
  });
  if (res.status() !== 200) return null;
  const cookie = res.headers()['set-cookie']?.split(';')[0] || '';
  return cookie || null;
}

async function changePasswordWithCookie(request: APIRequestContext, cookie: string, currentPass: string, newPass: string) {
  const res = await request.post('/api/auth/complete-password-change', {
    headers: cookie ? { cookie } : {},
    data: { currentPassword: currentPass, newPassword: newPass },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
}

test('staff can search a donor and check them in', async ({ page, request }) => {
  // 1) Create a donor via the public register API with a REAL slot id.
  const firstName = 'อีทูอี';
  const lastName = `สตาฟเช็ค${Date.now().toString().slice(-5)}`;
  const phone = `090${Math.floor(1000000 + Math.random() * 9000000)}`;
  const slotId = await getFirstFreeSlot(request);

  const regRes = await request.post('/api/events/mumt-2026/register', {
    data: {
      firstName,
      lastName,
      phone,
      email: '',
      participantType: 'GENERAL_PUBLIC',
      faculty: '',
      academicYear: '',
      donationExperience: 'FIRST_TIME',
      slotId,
      privacyAccepted: true,
    },
  });
  expect(regRes.status(), await regRes.text()).toBe(200);
  const regBody = await regRes.json();
  donorCode = regBody.registration?.registrationCode || regBody.registration?.registration_code;
  expect(donorCode).toMatch(/^LVU26-/);

  // 2) Admin/Staff sign-in with the known password.
  await page.goto('/staff/login');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.locator('#staff-email').fill(STAFF_EMAIL);
  await page.locator('#staff-password').fill(STAFF_PASS);

  for (let attempt = 0; attempt < 3; attempt++) {
    await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).click();
    try {
      await page.waitForURL(/\/(staff\/change-password|staff\/checkin|admin)/, { timeout: 4000 });
      break;
    } catch {
      await page.waitForTimeout(500);
    }
  }

  if (page.url().includes('/staff/change-password')) {
    await expect(page.getByRole('heading', { name: 'ตั้งรหัสผ่านใหม่' })).toBeVisible();
    await page.getByPlaceholder('รหัสที่ระบบแจกให้ครั้งแรก').fill(STAFF_PASS);
    await page.getByPlaceholder('อย่างน้อย 8 ตัวอักษร').first().fill(NEW_PASS);
    await page.getByPlaceholder('พิมพ์รหัสผ่านใหม่อีกครั้ง').fill(NEW_PASS);
    await page.getByRole('button', { name: 'บันทึกรหัสผ่านใหม่' }).click();
    await page.waitForURL(/\/(staff\/checkin|admin)/, { timeout: 15_000 });
  }

  if (!page.url().includes('/staff/checkin')) {
    await page.goto('/staff/checkin');
    await page.waitForLoadState('networkidle').catch(() => {});
  }

  await expect(page.getByRole('heading', { name: /ระบบเช็คอิน/ })).toBeVisible({ timeout: 10_000 });

  // 3) Search for the donor by code.
  const searchInput = page.locator('#ck-search');
  await searchInput.fill(donorCode);
  await searchInput.press('Enter');

  // The result panel shows the registration code and the REGISTERED badge.
  await expect(page.getByText(donorCode, { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/REGISTERED|ลงทะเบียนแล้ว/).first()).toBeVisible();

  // 4) Check the donor in.
  await page.getByRole('button', { name: /เช็คอิน/ }).first().click();
  await expect(page.getByText(/CHECKED IN|เช็คอินแล้ว/).first()).toBeVisible({ timeout: 15_000 });

  // 5) Confirm donation completed & souvenir given.
  await page.getByRole('button', { name: /บริจาคสำเร็จ/ }).first().click();
  await expect(page.getByText(/บริจาคสำเร็จ|COMPLETED/).first()).toBeVisible({ timeout: 15_000 });
});

test.afterAll(async ({ request }) => {
  if (donorCode) {
    await request.post('/api/events/mumt-2026/cancel', {
      data: { registrationCode: donorCode, reason: 'E2E teardown cleanup' },
    }).catch(() => {});
  }
  // Restore the staff password so the next run can sign in again.
  // If the account was forced to NEW_PASS this run, rotate back to STAFF_PASS.
  const cookie = await signIn(request, STAFF_EMAIL, NEW_PASS);
  if (cookie) {
    await changePasswordWithCookie(request, cookie, NEW_PASS, STAFF_PASS);
  }
});
