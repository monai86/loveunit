# Tech Stack Review Report — MUMT Blood Donation 2026

> Final consolidated report from the audit. Companion docs:
> `TECH_STACK_AUDIT.md` · `CURRENT_ARCHITECTURE.md` · `STACK_GAP_ANALYSIS.md` · `STACK_UPGRADE_PLAN.md` · `TESTING_GAP_ANALYSIS.md`

---

## 1. Current stack (verified, not assumed)

- **Framework:** Next.js 16.3.0 (App Router), React 19.2.8, TypeScript 5 (strict), no `pages/`.
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`) + custom "Warm Editorial Blood Drive" design system in `app/globals.css`.
- **Database:** Neon PostgreSQL via `@neondatabase/serverless` (server-only `DATABASE_URL`).
- **ORM:** Drizzle ORM 0.45 + drizzle-kit; `db/schema/*` → `db/migrations/0000..0002` (applied).
- **Auth:** Better Auth 1.6.27 (Drizzle adapter) + server RBAC (`requireStaff/TeamLead/Admin/SuperAdmin`) + forced first-login password change + real logout.
- **Validation:** Zod 4 (`lib/validation/schemas.ts`) — re-validated server-side on every write.
- **Service layer:** `services/*` (event, registration, checkin, queue, waitlist, content, admin, audit, email) — sole data-access path.
- **Dual data backend:** Drizzle→Neon when DB configured; `lib/db/store.ts` in-memory for dev/test; fails closed in production.
- **Email:** nodemailer/SMTP, silent no-op when unconfigured.
- **Export:** real `.xlsx` (2 sheets) via `xlsx`.
- **PWA:** manifest + `sw.js` offline shell + `lib/pwa/offline-queue` (staff offline check-in).
- **Tests:** 3 `tsx` suites (unit/logic, hardening, auth/RBAC). CI: lint → tsc → test → build.
- **Deploy:** `output: standalone` + multi-stage Dockerfile; host-agnostic.

---

## 2. Technologies actually used

Next.js · React · TypeScript · Tailwind v4 · Neon · Drizzle · drizzle-kit · Better Auth · Zod · nodemailer (conditional) · lucide-react · html5-qrcode · qrcode.react · xlsx · tsx · eslint/next.

## 3. Technologies partially used

| Item | Status |
| --- | --- |
| Email (nodemailer) | wired but SMTP not configured → no-op locally; flows ready |
| `pg` | indirect via neon-serverless; no direct import |
| `lib/types/database.ts` | snake_case memory types coexist with Drizzle camelCase (bridged by normalizers) |

## 4. Unused dependencies (installed, zero imports)

`canvas-confetti` (+types) · `clsx` · `class-variance-authority` · `tailwind-merge` — all safe to remove.

## 5. Duplicate technologies

| Pair | Winner | Notes |
| --- | --- | --- |
| Supabase SQL files vs Drizzle migrations | **Drizzle** | Supabase is files-only, zero imports |
| Memory store vs Drizzle | **Both, intentionally** | memory for dev/test only; production fails closed |
| Form state (manual) vs RHF | manual (no duplicate installed) | no RHF present |
| tsx vs Vitest/Jest | tsx (neither installed as runner) | framework optional |

## 6. Security concerns

- ✅ Auth: real Better Auth, RBAC enforced server-side, forced password change, session revocation. Verified live.
- ✅ DB: browser never touches Neon; `DATABASE_URL` server-only; fail-closed memory backend.
- ⚠️ Public POSTs (`/register`, `/waitlist`) have **no rate limiting / anti-bot** — recommended before public launch.
- ⚠️ SMTP unset → confirmation emails silently skipped (availability, not security).
- ℹ️ Dev fallback admin removed (only when no DB configured); verified.
- ℹ️ Existing docs: see `docs/SECURITY_AND_PRIVACY.md`, `docs/HUMAN_ACTIONS.md` (privacy approval, artwork, staff accounts pending).

## 7. Recommended target stack

**No stack migration needed.** The preferred target (Next/TS/Tailwind/Neon/Drizzle/Better Auth/Zod) is already the running stack. Focus: hygiene + security polish + testing + optional features.

## 8. Keep / Improve / Add / Remove Later

**KEEP:** Next.js, React, TS, Tailwind v4 + editorial design system, Neon, Drizzle, Better Auth + RBAC, Zod server validation, service layer, PWA offline, xlsx export, CI.

**IMPROVE:** rate limiting on public POSTs · real-DB test coverage · (LATER) email deliverability via Resend · type/token consolidation (low) · SQL KPI aggregation (low).

**ADD:** Playwright E2E (2 journeys) · Neon integration tests behind CI secret · feedback flow (schema ready) · (LATER) Turnstile.

**REMOVE LATER:** dead deps (canvas-confetti, clsx, cva, tailwind-merge) · `supabase/` legacy folder · superseded docs.

## 9. Recommended next phase

**Phase 1 — Hygiene:** remove dead deps + supabase dir (safe, mechanical, CI-green). Then **Phase 1b — rate limiting** on public POSTs, then **Phase 6 — Playwright E2E**. Feature work (feedback/blood-type) is product-gated.

## 10. Human actions required

- H-101 SMTP credentials (or Resend key + domain) → live confirmation email
- H-102 Cloudflare Turnstile keys (if adopted)
- H-103 CI `DATABASE_URL` secret → Neon integration tests
- H-104 production env secrets at deploy time
- H-105 pre-existing: privacy text approval, official artwork, final staff accounts

## 11. Risks

- **Low:** dead-dep removal (zero imports verified; any surprise → revert).
- **Low:** rate limiting false positives on event day (tune limits; allowlist staff IPs if needed).
- **Medium:** E2E flakiness if not written with explicit waits (mitigate: UI-state waits, memory backend, small suite).
- **Medium:** public launch depends on human items H-101…H-105 (email, secrets, approvals).
- **Low:** no anti-bot beyond rate limit until Turnstile decision.

## 12. Quality gates at audit time

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors (pre-existing warnings only) |
| `npm test` | ✅ all 3 suites pass |
| `npx next build` | ✅ (per CI) |
