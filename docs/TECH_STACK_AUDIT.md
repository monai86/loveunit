# Technology Stack Audit — MUMT Blood Donation 2026

> Audit date: August 2026 · Audited by: Codebuff (senior engineer review)
> Method: source inspection (imports + runtime paths), lockfile analysis, live API checks. No changes were made during this audit.

---

## 1. Technology Inventory

| Technology | Installed | Actually Used | Where Used | Status | Recommendation |
| ---------- | --------: | ------------: | ---------- | ------ | -------------- |
| Next.js | Yes | Yes | `app/*` (App Router), route handlers | ACTIVE | Keep |
| React 19 | Yes | Yes | `app/*`, `components/*` | ACTIVE | Keep |
| TypeScript | Yes | Yes | all `*.ts(x)` — `strict: true` | ACTIVE | Keep |
| Tailwind CSS v4 | Yes | Yes | `app/globals.css`, utility classes throughout | ACTIVE | Keep |
| Custom design system (editorial-*) | Yes | Yes | `globals.css` (Warm Editorial Blood Drive tokens) | ACTIVE | Keep — do not reset |
| Neon PostgreSQL | Yes | Yes | `db/client.ts` (serverless pool), live `.env.local` | ACTIVE | Keep |
| Drizzle ORM | Yes | Yes | `db/schema/*`, all `services/*` queries | ACTIVE | Keep |
| drizzle-kit | Yes | Yes | `drizzle.config.ts`, `db/migrations/*` | ACTIVE | Keep |
| Better Auth | Yes | Yes | `lib/auth/*`, `/api/auth/*`, staff/admin gating | ACTIVE | Keep |
| Zod | Yes | Yes | `lib/validation/schemas.ts`, server route validation | ACTIVE | Keep |
| nodemailer | Yes | Yes (conditional) | `services/email-service.ts` (SMTP, no-op if unset) | PARTIAL | Keep; consider Resend later |
| lucide-react | Yes | Yes | icons across UI | ACTIVE | Keep |
| html5-qrcode | Yes | Yes | staff checkin scanner | ACTIVE | Keep |
| qrcode.react | Yes | Yes | donor pass / lookup pages | ACTIVE | Keep |
| xlsx | Yes | Yes | `app/api/admin/export/route.ts` (real .xlsx) | ACTIVE | Keep |
| tsx | Yes | Yes | `tests/*` runner, `scripts/*` | ACTIVE | Keep |
| canvas-confetti | Yes | **No** | no imports found | CONFIGURED_BUT_UNUSED | Remove later |
| clsx | Yes | **No** | no imports found | CONFIGURED_BUT_UNUSED | Remove later |
| class-variance-authority | Yes | **No** | no imports found | CONFIGURED_BUT_UNUSED | Remove later |
| tailwind-merge | Yes | **No** | no imports found | CONFIGURED_BUT_UNUSED | Remove later |
| pg | Yes | Indirect | `@neondatabase/serverless` uses it; no direct import | PARTIAL | Keep (transitive) |
| Supabase | No (client libs removed) | No | only `supabase/migrations/*.sql` + `supabase/seed.sql` legacy files remain | LEGACY | Remove files later |
| shadcn/ui | No | No | no `components.json`, no `@radix-ui/*` | MISSING | Do not add unless needed |
| react-hook-form | No | No | forms use manual `useState` | MISSING | Optional — see plan |
| Vitest | No | No | — | MISSING | Optional (tsx suites already pass) |
| Playwright | No | No | — | MISSING | Add for E2E (value) |
| Resend | No | No | — | MISSING | LATER (SMTP works) |
| React Email | No | No | templates are inline HTML strings | MISSING | LATER |
| Cloudflare Turnstile | No | No | — | MISSING | LATER (public POST abuse) |
| Vercel Blob / R2 | No | No | assets are static in `public/` | MISSING | NOT REQUIRED now |

---

## 2. Installed Dependencies vs. Real Usage

### Dependencies actually imported and exercised
`next`, `react`, `react-dom`, `@neondatabase/serverless`, `drizzle-orm`, `better-auth`, `zod`, `tailwindcss` (v4 via postcss), `lucide-react`, `html5-qrcode`, `qrcode.react`, `xlsx`, `nodemailer`, `tsx`, `@tailwindcss/postcss`, `autoprefixer`, `drizzle-kit`, `eslint`, `eslint-config-next`, `typescript`, `@types/*`.

### Installed but not imported anywhere
| Package | Evidence | Verdict |
| --- | --- | --- |
| `canvas-confetti` (+ `@types/canvas-confetti`) | zero imports in `app/ components/ lib/ services/` | dead — remove later |
| `clsx` | zero imports | dead — remove later |
| `class-variance-authority` | zero imports, no `cva(` call | dead — remove later |
| `tailwind-merge` | zero imports | dead — remove later |

> These four look like a half-started shadcn/ui setup (cva + clsx + tailwind-merge are its utilities). They were never wired up. Removing them is safe *after* confirming no hidden usage (verified: none).

### Packages in lockfile but NOT installed (peer declarations only)
`vitest`, `prisma`, `@playwright/test`, `playwright` appear only as **peerDependencies** of `better-auth`, `@better-auth/prisma-adapter`, or `next`. They are **not** present in `node_modules` and not used.

---

## 3. Framework Audit (Next.js)

- **Router:** App Router only (no `pages/`).
- **Version:** Next.js `16.3.0`, React `19.2.8`.
- **Server Components:** default; most pages are server components; interactive pages opt in with `'use client'` (register, staff pages, admin).
- **Route Handlers:** `app/api/*` — full REST surface (public register/lookup/slots, staff checkin/search/queue/walk-in/stats, admin CRUD/export/waitlist/audit, auth).
- **Server Actions:** not used (API routes + fetch pattern instead). Consistent — keep.
- **middleware/proxy:** none exists. Auth gating is done via server layouts + route-handler guards (`requireStaff/Admin`). This works; a `middleware.ts` cookie check is optional polish, not required.
- **Client/server boundary:** clean — `services/*` and `db/*` are server-only; `'use client'` components fetch APIs.

---

## 4. TypeScript Audit

- `strict: true`, `moduleResolution: bundler`, `jsx: react-jsx`, `noEmit`.
- `@/*` path alias → repo root.
- **`any` usage:** some pre-existing `as any` casts in a few API routes (e.g. export route normalization) — lint-flagged as warnings only; guarded, not a correctness issue.
- Generated DB types: Drizzle schema is source of truth (`db/schema/*`), plus hand-written `lib/types/database.ts` for memory-backend shapes (snake_case) — **this is the main type duplication** (Drizzle returns camelCase; memory store returns snake_case). Normalizers already bridge the gap.
- API payload types: mostly inferred from service returns; some client components re-declare shapes. Acceptable.

**Recommendation:** keep. Optionally add `zod` inferred types at API boundaries (already partially done via `z.infer`).

---

## 5. Tailwind Audit

- **Version:** Tailwind v4 (`@import "tailwindcss"` + `@tailwindcss/postcss`).
- **Design tokens:** custom CSS variables in `:root` (`--editorial-bg`, `--editorial-burgundy`, etc.) — **Warm Editorial Blood Drive** system.
- Custom utility classes: `.editorial-card`, `.editorial-btn-primary/secondary`, `.editorial-input`, `.unit-tag`, `.editorial-ticket`, typography helpers.
- Arbitrary values: some inline hex in components (`#282828`, `#8E0015`, `#F0C4CC`) duplicate the tokens — candidates for consolidation, low priority.
- Responsive: mobile-first with `sm:`/`md:` breakpoints, custom mobile bottom nav.

**Preserve.** Do not reset to stock Tailwind.

---

## 6. shadcn/ui Audit

- `components.json`: **not present**.
- `@radix-ui/*`: **not installed**.
- Installed `cva`/`clsx`/`tailwind-merge` are unused (see above).
- All UI is hand-built project components (`components/ui/TicketStub.tsx`, layout components, admin panels).

**Verdict:** shadcn/ui is absent. Because the design system is mature and cohesive, adding shadcn is **optional** and only as primitives (dialog/toast) — not a rewrite.

---

## 7. Form Handling Audit

| Form | File | State | Validation client | Validation server | Notes |
| --- | --- | --- | --- | --- | --- |
| Public registration (3-step) | `app/register/page.tsx` | manual `useState` (`formData`) | manual per-step checks | ✅ Zod `publicRegistrationSchema.safeParse` | server-side authoritative |
| Walk-in registration | `app/staff/(portal)/walk-in/page.tsx` | manual `useState` | manual | ✅ Zod `walkInRegistrationSchema` | |
| Staff login | `app/staff/login/page.tsx` | manual `useState` | required attrs | ✅ Better Auth sign-in | |
| Force password change | `app/staff/change-password/page.tsx` | manual `useState` | manual (length/match) | ✅ server verifies current + updates | |
| Admin content edit | `app/admin/content/page.tsx` | manual `useState` (blocks) | none | ✅ `eventContentBlockSchema` in API | |
| Lookup (forgot QR) | `app/lookup/page.tsx` | manual | manual | ✅ Zod in lookup route | |
| Staff search | checkin page | manual | — | route-level `requireStaff` | |

**Pattern:** client checks are UX sugar; every write goes through a server route that re-validates with Zod. This satisfies the "server validation is security" rule. RHF would reduce boilerplate but is **not** required for correctness.

---

## 8. Database Audit

- **Runtime DB:** Neon PostgreSQL (`@neondatabase/serverless` Pool in `db/client.ts`), live via `DATABASE_URL` in `.env.local`. Confirmed by live queries (auth tables + registration rows exist).
- **ORM:** Drizzle (`db/schema/*` → `db/migrations/*` → `drizzle-kit`). Migrations `0000`, `0001`, `0002` applied.
- **Dual backend:** `lib/db/store.ts` implements an **in-memory backend** used when `DATA_BACKEND=memory`, `NODE_ENV=test`, or `NODE_ENV=development`. Services branch on `isMemoryBackendAllowed()`. In production (`NODE_ENV=production` without `DATA_BACKEND=memory`) it **fails closed** (throws) — verified by tests.
- **Raw SQL:** no direct `pg` queries in app code; `scripts/apply-migration.ts` uses Drizzle `sql.raw` for migrations.
- Browser never connects to the DB; `DATABASE_URL` is server-only. ✅

**Concern (documented, not blocking):** in local dev with a real `DATABASE_URL`, services still prefer the memory backend. That is intentional for offline dev but means local dev does **not** exercise Drizzle unless `DATA_BACKEND` is unset and env forces the DB path. The seed scripts and staff accounts live in Neon, so auth does hit the real DB.

---

## 9. Supabase Audit

- **Client/server libraries:** removed (`lib/supabase/*` deleted; `@supabase/*` not in lockfile).
- **Remaining:** `supabase/migrations/20260101000000_initial_schema.sql` and `supabase/seed.sql` — **legacy SQL files only**, imported by nothing.
- **Zero runtime usage.** Classified: Postgres ✗ · Auth ✗ · Storage ✗ · Realtime ✗ · RPC ✗ · RLS ✗.

**Action:** remove the `supabase/` directory in Phase 1 (after docs confirm the Drizzle schema is authoritative — it is).

---

## 10. Drizzle Audit

- `drizzle.config.ts` present, reads `.env.local`.
- `db/schema/*` covers: `events`, `time_slots`, `registrations`, `staff_profiles`, `event_content_blocks`, `checkin_events`, `audit_logs`, `feedback`, `user`/`session`/`account`/`verification` (Better Auth), `waitlist`.
- Migrations: `0000` (initial), `0001` (waitlist), `0002` (must_change_password) — all applied to Neon.
- Services use `db.query.*` + `db.select()/insert()/update()/transaction()` with `FOR UPDATE` capacity locking in checkin/registration flows.
- `feedback` table exists in schema + migration **but has no service/UI/API yet** (documented as gap, not a defect).

---

## 11. Data Model Audit (vs. approved model)

| Entity | Table | Status | Notes |
| --- | --- | --- | --- |
| events | `events` | ✅ | slug unique, status enum, timestamps |
| time_slots | `time_slots` | ✅ | capacity default 35, booked_count, is_active |
| registrations | `registrations` | ✅ | unique `registration_code`, unique `qr_token`, unique index `(event_id, phone_normalized)` |
| staff_profiles | `staff_profiles` | ✅ | FK → `user`, role enum, is_active |
| event_content_blocks | `event_content_blocks` | ✅ | display_order, is_visible |
| checkin_events | `checkin_events` | ✅ | action + performed_by → user |
| audit_logs | `audit_logs` | ✅ | actor → user |
| feedback | `feedback` | ⚠️ | **table exists, no code path** — future feature |
| waitlist | `waitlist` | ✅ | status enum, promoted_registration_id |
| user/session/account/verification | Better Auth tables | ✅ | + `must_change_password` (0002) |

No schema rewrites needed. `feedback` is the only table without a service layer.

---

## 12. Authentication Audit

- **Runtime:** Better Auth (`better-auth@1.6.27`) + Drizzle adapter + Neon.
- **Session:** httpOnly cookie, origin/CSRF checked, `getSession` verified live.
- **Staff login:** real `signIn.email` (replaced fake localStorage — verified working).
- **First-login password change:** enforced server-side via `must_change_password` flag + `/staff/change-password` + `complete-password-change` API.
- **Logout:** `signOut` revokes session (verified).
- Public donors: no account required. ✅
- No NextAuth/Auth.js, no JWT in app code, no localStorage session anywhere.

---

## 13. RBAC Audit

Server-side guards in `lib/auth/server.ts`:
- `requireStaff()` → STAFF/TEAM_LEAD/ADMIN/SUPER_ADMIN
- `requireTeamLead()` → TEAM_LEAD/ADMIN/SUPER_ADMIN
- `requireAdmin()` → ADMIN/SUPER_ADMIN
- `requireSuperAdmin()` → SUPER_ADMIN
- Guards accept an injected user (test-friendly) and throw `UNAUTHORIZED`/`FORBIDDEN`.

Verified live:
- `/api/staff/*` behind `requireStaff` (401/403).
- `/api/admin/*` behind `requireAdmin`/`requireTeamLead` (403 for staff).
- `/staff/(portal)/*` and `/admin/*` pages gated by server layouts (redirect to login).
- No reliance on frontend button hiding for authorization. ✅

---

## 14. Email Audit (Resend / nodemailer)

- **Installed:** `nodemailer` — used by `services/email-service.ts`.
- **Configured:** SMTP env vars in `.env.example` (`SMTP_HOST/PORT/USER/PASS/FROM`); **not set** in local `.env.local` → sending is a silent no-op.
- **Actually sending:** no (SMTP unset). Code path is real and tested at the unit level.
- **Resend / React Email:** not installed.

**Classification:** email is PARTIAL — infrastructure exists, provider not configured. Registration confirmation is the only current flow (MVP). Resend migration is LATER and optional; SMTP already satisfies the flow when credentials exist.

---

## 15. Turnstile Audit

- No Turnstile widget, no site/secret keys, no `siteverify` call, no token handling.
- Public write endpoints today: `POST /api/events/[slug]/register`, `POST /api/events/[slug]/waitlist`, `POST /api/staff/walk-in` (staff-gated), `POST /api/registrations/lookup` (GET-ish POST).

**Verdict:** MISSING. Anti-bot is a real concern for public registration. Priority: LATER (after DB/auth hygiene); adds human action (Cloudflare keys). Consider rate limiting first (simpler, no external keys).

---

## 16. File Storage Audit

- All assets are static in `public/` (`images/logo.png`, SVG placeholders).
- Admin content uses image **URLs** (no upload); the placeholder that referenced `storage.supabase.co` was already fixed.
- No upload requirement in scope.

**Verdict:** no object storage needed now. If admin uploads become approved, smallest option is Vercel Blob (same platform) or keep URL-only.

---

## 17. Testing Audit

- **Runner:** `tsx` (no Vitest/Jest). Three suites in `tests/`:
  1. `registration.test.ts` — registration window, state machine, duplicate phone, content persistence.
  2. `production_hardening.test.ts` — QR entropy, transitions, atomic capacity, memory fail-closed.
  3. `auth.test.ts` — Better Auth memory-adapter HTTP flows (signup/signin/change-password/signout) + RBAC guards.
- **E2E:** none (no Playwright).
- **DB integration:** exercised against Neon via live API tests during development; not automated in CI (CI has no DATABASE_URL — memory backend covers logic).
- CI (`.github/workflows/ci.yml`): lint → tsc → `npm test` → `npx tsx tests/auth.test.ts` → build. All pass.

See `docs/TESTING_GAP_ANALYSIS.md` for detail.

---

## 18. Vercel / Deployment Audit

- `next.config.ts`: `output: "standalone"` (Docker-friendly).
- Dockerfile: multi-stage, `node:20-alpine`, copies standalone + static + public; runtime secrets via env.
- `Dockerfile` + `.dockerignore` present; `.github/workflows/ci.yml` present.
- Env vars documented in `.env.example` and README.
- **Not Vercel-specific** — no `vercel.json`, no Vercel runtime config, no edge functions. The app targets any Node host (standalone/Docker). **Decision: keep host-agnostic.** If Vercel is chosen later, the standalone output works there too.

---

## 19. Performance Review (observations only)

- `'use client'` used only where interactivity requires it (register/staff/admin) — good.
- Icons from `lucide-react` (tree-shaken, fine).
- Admin dashboard: fetches real KPIs + registrations; no full-table scan beyond current event (indexed).
- Images: `logo.png` single asset; SVG placeholders — no heavy media.
- Offline-first SW + action queue add resilience without perf cost.
- Minor: several client components re-fetch on mount; acceptable for this scale.

No performance-critical issues found. No refactor recommended as part of stack work.

---

## 20. Verification (quality gates at audit time)

| Gate | Command | Result |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit` | ✅ 0 errors |
| Lint | `npx eslint` | ✅ 0 errors (pre-existing warnings only) |
| Unit/integration | `npm test` | ✅ all 3 suites pass |
| Build | `npx next build` (via CI) | ✅ |

---
