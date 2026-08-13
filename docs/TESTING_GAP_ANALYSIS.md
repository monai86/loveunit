# Testing Gap Analysis — MUMT Blood Donation 2026

---

## 1. Current Testing Stack

| Layer | Tool | Files | Runs in CI? |
| --- | --- | --- | --- |
| Unit / logic | `tsx` + `node:assert` (no framework) | `tests/registration.test.ts`, `tests/production_hardening.test.ts` | ✅ `npm test` |
| Auth integration | `tsx` + Better Auth **memory adapter** (full HTTP via `auth.handler()`) | `tests/auth.test.ts` | ✅ `npm test` + dedicated step |
| RBAC guards | same suite, injected users | `tests/auth.test.ts` (tests 5–8) | ✅ |
| DB integration (real Neon) | none automated | — | ❌ (manual during dev) |
| E2E (browser) | `@playwright/test` (Chromium) against a **production standalone server** (`next build` into `.next-e2e` + `server.js`) | `tests/e2e/smoke.spec.ts`, `tests/e2e/donor-register.spec.ts`, `tests/e2e/staff-checkin.spec.ts` | ✅ gated on `secrets.DATABASE_URL` |

**Runner choice:** `tsx` (no Vitest/Jest installed — verified in lockfile). The suites are lightweight and fast; introducing Vitest is **optional** and only for nicer DX (watch/coverage), not required for correctness.

---

## 2. Coverage Today (what is actually asserted)

### registration.test.ts
- Registration window open/close rules
- Status state machine transitions (valid + invalid rollback)
- Atomic duplicate-phone prevention (normalized)
- Real content-block DB update (memory backend)
- Fail-closed production storage rule

### production_hardening.test.ts
- QR token: prefix, length, entropy, no PII
- Registration window timestamps
- State machine validity
- Atomic capacity + normalized duplicate lock
- Admin content persistence (no fake setTimeout)
- Memory-backend fail-closed inspection

### auth.test.ts
- sign-up creates user
- sign-in: correct password → session; wrong password → 401
- session cookie validity
- change password: old rejected / new accepted
- sign-out: session revoked
- RBAC: requireStaff/requireTeamLead/requireAdmin/requireSuperAdmin with injected users (UNAUTHORIZED / FORBIDDEN paths)

---

## 3. Gaps by Required Category (from audit prompt)

| Category | Coverage | Gap | Priority |
| --- | --- | --- | --- |
| Unit — validation | ✅ Zod schemas exercised indirectly via API tests | dedicated schema unit tests (optional) | LOW |
| Unit — normalization | ✅ phone normalization tested via duplicate path | QR/code generator unit tests | LOW |
| Unit — status transitions | ✅ | — | — |
| Unit — permissions | ✅ RBAC guard tests | — | — |
| Unit — helpers | partial (QR, phone) | `formatTimeRange`, Thai date/format helpers | LOW |
| DB integration — duplicate protection | ✅ (memory backend) | **real Neon** duplicate + transaction behavior | **HIGH** |
| DB integration — slot capacity | ✅ (memory backend) | real DB `FOR UPDATE` race | **HIGH** |
| DB integration — transaction rollback | partial | explicit rollback test | MED |
| DB integration — waitlist promote | manual | automated real-DB test | MED |
| Auth — unauthenticated denied | ✅ (guard tests + live API checks) | automated route-level 401/403 tests | MED |
| Auth — staff allowed / admin denied | ✅ guards + live checks | route-level automation (Playwright or request-level) | MED |
| E2E — Register → Confirmation → QR | ❌ | **Playwright journey A** | **HIGH** |
| E2E — Staff login → Search/Scan → Check-in | ❌ | **Playwright journey B** | **HIGH** |

---

## 4. Recommended Additions (in order of value)

### 4.1 Playwright E2E (HIGH) — ✅ IMPLEMENTED
- `@playwright/test` (devDep) installed; runs **Chromium only** against a **production standalone server** — not the dev server (dev/webpack recompiles mid-test and hard-reloads the page, wiping form state).
- Two journeys + a smoke spec:
  - **smoke:** home page renders (hero heading + CTA).
  - **A (`donor-register`):** `/register` → fill 3 steps → consent → submit → redirect to `/registration/{code}` → QR `<svg role="img">` + donor name visible.
  - **B (`staff-checkin`):** `/staff/login` → (handles forced first-login password change, both states) → search donor by code → REGISTERED badge → check-in → CHECKED IN. `afterAll` rotates the staff password back so it can re-run.
- Server lifecycle:
  - `NEXT_DIST_DIR=.next-e2e npm run build` (separate dist dir — never clobbers a running dev server's `.next`).
  - `node scripts/start-e2e-server.mjs` — copies static + public into the standalone dir and runs `server.js` (port `3003`, override with `PORT`/`E2E_BASE_URL`).
  - Seeding: `scripts/seed-staff.ts` (auth accounts) + `scripts/seed-e2e.ts` (event, content blocks, slots — idempotent; registration window widened only when needed so journeys pass on any date).
- **Bug caught by E2E:** the register form sent `participantType: 'GENERAL'` but the schema/DB enum expects `GENERAL_PUBLIC` — anyone choosing “บุคคลทั่วไป” was rejected. Fixed in `app/register/page.tsx`.
- Local run: `E2E_BASE_URL=http://localhost:3003 npx playwright test`.
- Chromium note (macOS dev): the headless-shell variant fails to download on some machines; `playwright.config.ts` resolves the full “Google Chrome for Testing” executable automatically, and falls back to Playwright's default on Linux CI.

### 4.2 Neon integration tests (HIGH value, needs secret)
- New `tests/db.integration.test.ts`, **skipped** when `DATABASE_URL` is absent (so CI without secrets still passes).
- CI secret: `DATABASE_URL` (HUMAN ACTION H-103).
- Cases:
  1. duplicate normalized phone → second insert rejected
  2. slot capacity race → only `capacity` registrations succeed
  3. transaction rollback on failed check-in transition
  4. waitlist promote → registration created, waitlist entry NOTIFIED
  5. forced password change flag round-trip (auth, real adapter)
- Isolation: dedicated test schema or transactional rollback; teardown after run.

### 4.3 Request-level auth route tests (MED)
- Spin the Next dev server (or use route handler unit invocation) to assert:
  - anonymous → `/api/admin/*` = 401
  - staff session → `/api/admin/*` = 403, `/api/staff/*` = 200
  - admin session → both 200
- This closes the "route-level" gap that guard tests only approximate.

### 4.4 Coverage (optional)
- If a coverage tool is desired, `vitest` + `@vitest/coverage-v8` (swap tsx suites gradually). Not required.

---

## 5. What NOT to add now

- Cypress (Playwright chosen if we add one).
- Jest (tsx + node:assert already passes; no benefit).
- Testing Library (Next App Router + client pages are exercised via Playwright; component-level tests add little here).
- Snapshot tests (UI churns; low value).

---

## 6. CI Integration

Current `.github/workflows/ci.yml`:

```yaml
Lint → Typecheck → npm test → auth integration (tsx) → build
```

Implemented:
```yaml
- ci job:    lint → typecheck → npm test → auth integration (tsx) → build
- e2e job:   (only if secrets.DATABASE_URL set) npm ci → playwright install --with-deps chromium
             → apply-migration.ts → seed-staff.ts → seed-e2e.ts
             → NEXT_DIST_DIR=.next-e2e build → start standalone server → playwright test
```

Still future: Neon integration test suite (only if secrets.DATABASE_URL present, else skip) — see 4.2.

---

## 7. Acceptance Criteria

- `npm test` → all suites green (today: ✅).
- `npx playwright test` → smoke + journeys A + B green (currently 3/3 ✅).
- Neon integration suite: green locally with real `DATABASE_URL`, skipped cleanly in CI without it.
- No flaky timers; E2E uses explicit waits on UI states, not sleeps.
