# Incremental Stack Upgrade Plan — MUMT Blood Donation 2026

> Principle: KEEP good work · FILL gaps · MIGRATE only what needs migration.
> No phase here rewrites working code. Each phase ends with green gates:
> `npx tsc --noEmit`, `npm run lint`, `npm test`, `npx next build`.

---

## PHASE 0 — Audit (this document set) ✅

- `docs/TECH_STACK_AUDIT.md`, `docs/CURRENT_ARCHITECTURE.md`, `docs/STACK_GAP_ANALYSIS.md`, `docs/TESTING_GAP_ANALYSIS.md`, `docs/TECH_STACK_REVIEW_REPORT.md`.
- **Result:** the target stack (Next/TS/Tailwind/Neon/Drizzle/Better Auth/Zod) is **already implemented**. Remaining work is hygiene, security polish, and optional features.

---

## PHASE 1 — Clean current stack (safe, mechanical) ✅

**Goal:** remove verified dead code with zero behavior change. **Done.**

1. Removed unused deps: `canvas-confetti`, `@types/canvas-confetti`, `clsx`, `class-variance-authority`, `tailwind-merge`.
2. Removed legacy `supabase/` directory (migrations + seed superseded by `db/migrations/*`).
3. Fixed 50 pre-existing `no-explicit-any` lint errors along the way (dual-shape access via new `pickField()` in `lib/utils/format.ts`, `catch (err: unknown)` + `getErrorMessage()`, 2 unescaped entities).
4. Gate passed: tsc 0 errors, lint 0 errors (47 pre-existing warnings), all tests, production build.

---

## PHASE 1b — Security polish (recommended before public launch) ✅

**Goal:** protect public write endpoints from spam without external keys. **Done.**

1. Added `lib/rate-limit.ts` — in-memory sliding-window limiter (per IP, server-only, fail-open on missing header).
2. Wired into public POSTs:
   - `POST /api/events/[slug]/register` — 20 req/min/IP
   - `POST /api/events/[slug]/waitlist` — 10 req/min/IP
   - (staff endpoints already behind auth)
3. Verified live: burst of 25 → 20 pass + 5 × **429**; legit single requests unaffected.
4. Turnstile stays deferred — re-evaluate if spam persists.

**Gate:** burst → 429s; legit flow unaffected. ✅

---

## PHASE 2 — Database foundation

Already at target (Neon + Drizzle + migrations applied). No migration needed.

Optional hardening (low priority):
- Add indexes if query patterns demand (e.g. `registrations(event_id, status)` for KPI queries).
- Move KPI aggregation to SQL `GROUP BY` if dataset grows.

---

## PHASE 3 — Authentication / authorization

Already at target (Better Auth + `require*` guards + forced password change + logout). No work required.

Optional:
- `middleware.ts` cookie pre-check for `/staff/*`, `/admin/*` (skip layout render when no session) — nice-to-have only.

---

## PHASE 4 — Forms / validation cleanup

Current state is safe (client UX checks + server Zod). Optional cosmetic migration to React Hook Form — **not recommended** now (no bug it fixes).

Priorities if pursued:
1. `register` (largest form) → RHF + `zodResolver`
2. `walk-in` → RHF
3. login / change-password / admin content — leave as-is (tiny forms)

**Decision:** skip unless a concrete UX bug appears.

---

## PHASE 5 — Email / anti-bot (only where needed)

### Email (LATER)
- Keep nodemailer/SMTP for MVP. When deliverability matters:
  - HUMAN ACTION REQUIRED — Resend API key + domain verification.
  - Add `resend` + `react-email`, port `buildHtml` → `.tsx` template, keep `sendRegistrationConfirmation` signature.
  - Parity test: send to real inbox, verify QR link + Thai template.
- Flow priority: registration confirmation (MVP) → reminder (LATER) → thank-you (LATER). Staff invitation/password-reset already handled by Better Auth.

### Anti-bot (Phase 1b rate limit → Turnstile later)
- HUMAN ACTION REQUIRED — Cloudflare Turnstile site keys; classify public vs secret.

---

## PHASE 6 — Testing

See `docs/TESTING_GAP_ANALYSIS.md` for full detail. Short version:

1. **Unit (existing, keep):** tsx suites cover validation, state machine, QR entropy, RBAC guards, auth HTTP flows. ✅
2. **Playwright E2E ✅ implemented** (`tests/e2e/`):
   - smoke → home page renders
   - Journey A (`donor-register`): `Register → Confirmation → QR pass`
   - Journey B (`staff-checkin`): `Staff login → (forced pw change) → Search → Check-in`
   - Runs against a **production standalone server** (`NEXT_DIST_DIR=.next-e2e` build + `scripts/start-e2e-server.mjs`), seeded via `scripts/seed-staff.ts` + `scripts/seed-e2e.ts`.
   - CI: separate `e2e` job in `.github/workflows/ci.yml`, gated on `secrets.DATABASE_URL` (skipped cleanly when absent).
   - E2E caught a real production bug: `participantType: 'GENERAL'` vs `GENERAL_PUBLIC` — fixed in `app/register/page.tsx`.
3. **Neon integration tests (optional, high value) — still open:**
   - Real-DB suite behind CI secret `DATABASE_URL` (skipped when absent):
     - duplicate phone prevention, slot capacity race, transaction rollback, waitlist promote.
   - Pattern: dedicated test schema + `scripts/apply-migration.ts` + teardown.

---

## PHASE 7 — Remove legacy dependencies

Already scoped in Phase 1 (5 dead packages + supabase dir). Everything else is genuinely used.

---

## Migration safety checklist (applies to any replacement)

```text
OLD ──► NEW implemented ──► PARITY TEST ──► SWITCH ──► VERIFY ──► REMOVE OLD
```

No phase deletes a working path before its replacement is proven.

---

## Decision table

| Area | Current | Target | Decision | Reason |
| ---- | ------- | ------ | -------- | ------ |
| Framework | Next.js 16 App Router | same | KEEP | already target |
| UI | Tailwind v4 + custom editorial system | same | KEEP | cohesive, distinct |
| shadcn/ui | absent | optional primitives only | DO NOT ADD NOW | no gap it fills |
| Forms | manual state + server Zod | same (optional RHF) | KEEP | secure as-is |
| Database | Neon PostgreSQL | Neon | KEEP | target reached |
| ORM | Drizzle + drizzle-kit | same | KEEP | target reached |
| Auth | Better Auth + RBAC | same | KEEP | target reached |
| Email | nodemailer/SMTP | Resend (LATER) | DEFER | SMTP suffices for MVP |
| Anti-bot | none | rate limit → Turnstile (LATER) | ADDED rate limit ✅ | public POSTs protected |
| Testing | tsx suites | + Playwright E2E, optional Neon int tests | ADDED E2E ✅ | critical journeys proven in CI |
| Storage | static public/ | none | DO NOT ADD | no uploads required |
| Dead deps | canvas-confetti, clsx, cva, tailwind-merge | removed | REMOVED ✅ | zero imports |
| Legacy | supabase/ dir | removed | REMOVED ✅ | zero imports |
| Deploy | standalone Docker + CI | host-agnostic | KEEP | works on Vercel too |

---

## Human actions required (summary)

| ID | Task | Blocks |
| --- | --- | --- |
| H-101 | SMTP credentials (or Resend key + domain) | live confirmation email |
| H-102 | Cloudflare Turnstile site keys (if adopted) | anti-bot beyond rate limiting |
| H-103 | CI `DATABASE_URL` secret | Neon integration tests in CI |
| H-104 | Production secrets in deploy env (DATABASE_URL, BETTER_AUTH_SECRET, SMTP_*) | production launch |
| H-105 | (pre-existing, from `docs/HUMAN_ACTIONS.md`) privacy text approval, official artwork, final staff accounts | public launch |

**RESUME CHECKPOINT: H-101…H-105** (see `docs/HUMAN_ACTIONS.md` ledger for detail).
