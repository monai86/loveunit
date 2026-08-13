# Stack Gap Analysis — MUMT Blood Donation 2026

> Evidence-based. Only items with real code paths or verified absence are listed.

---

## KEEP — already correctly implemented

| Item | Why keep |
| --- | --- |
| Next.js 16 App Router | modern, correct routing; no reason to change |
| React 19 + TypeScript (strict) | type-safe baseline |
| Tailwind CSS v4 | working, v4-current |
| Custom "Warm Editorial Blood Drive" design system | cohesive, distinct, must survive all changes |
| Neon PostgreSQL + Drizzle ORM + drizzle-kit | the target stack is already here, running, with migrations applied |
| Better Auth + RBAC guards | fully implemented: real sign-in/out, server-side `require*`, forced password change |
| Zod server validation | every public/admin write re-validates server-side |
| Service layer (`services/*`) | clean separation; DB access is server-only |
| PWA offline shell + action queue | real value for venue tablets; already tested |
| Real .xlsx export | implemented and verified |
| CI (lint → tsc → test → build) | passing |
| tsx test runner + 3 suites | no framework needed for current coverage |

---

## IMPROVE — exists but can be strengthened

| Item | Current | Improvement | Priority |
| --- | --- | --- | --- |
| Email delivery | nodemailer/SMTP, unconfigured → no-op | either (a) set SMTP creds, or (b) migrate to Resend for deliverability + React Email templates | LATER (not blocking) |
| Rate limiting / anti-abuse | none on public POSTs | add lightweight rate limit (e.g. `upstash-rate-limit` or in-app sliding window) before Turnstile; Turnstile later | MEDIUM |
| Type duplication | snake_case memory types vs camelCase Drizzle | keep normalizers; optionally narrow `as any` spots in export/registrations routes | LOW |
| Duplicated design tokens | inline hex in components vs CSS vars | consolidate arbitrary values into the editorial tokens | LOW |
| Admin KPIs | JS aggregation over fetched rows | move to SQL aggregates if data grows | LOW |
| `feedback` table | schema only, no service/UI/API | implement feedback flow (post-donation form + admin view) — existing schema ready | MEDIUM (feature) |
| Auth integration tests | manual + one suite | already automated in `tests/auth.test.ts` (memory adapter) | DONE |
| E2E | none | Playwright for register→QR and staff login→check-in | MEDIUM (see testing doc) |

---

## ADD — missing capability with clear value

| Item | Problem it solves | Needed now? | Complexity |
| --- | --- | --- | --- |
| Playwright E2E | no automated proof the public + staff journeys work end-to-end | Recommended (next test phase) | Medium |
| Real DB integration tests | Drizzle/Neon paths tested only manually | High value; needs CI DATABASE_URL or testcontainers/pg-mem | Medium |
| Rate limiting on public POSTs | registration spam / waitlist spam | Recommended before public launch | Low |
| Feedback flow (donor post-donation) | `feedback` table unused; organizers want post-event data | Feature decision | Low-Med |
| Blood type (ABO/Rh) capture | schema lacks column; medical value | Feature decision | Low-Med (migration) |
| Middleware cookie pre-check | avoids server render on unauthenticated staff pages | Nice-to-have polish | Low |

### Explicitly NOT adding now
- **Cloudflare Turnstile** — deferred until rate limiting is in; needs human key setup. If added: only on `POST /register` + `POST /waitlist`, with server-side `siteverify`.
- **Vercel Blob / R2** — no upload requirement; assets are static.
- **shadcn/ui** — no `components.json`, no Radix; design system is hand-built and cohesive. If needed later, use shadcn primitives (dialog/toast) only.
- **React Hook Form** — forms work with manual state + server Zod. Migration would be cosmetic; optional, low priority.
- **Resend / React Email** — SMTP already satisfies; only if deliverability/ops demands it.
- **Server Actions** — API routes are consistent and tested; no benefit to mixing in actions now.

---

## REMOVE LATER — legacy / duplicate / dead

| Item | Evidence | Removal trigger |
| --- | --- | --- |
| `supabase/` directory (`migrations/*.sql`, `seed.sql`) | zero imports; Supabase client libs already deleted | safe now — remove in Phase 1 |
| `canvas-confetti` (+ types) | no imports | safe now — remove |
| `clsx` | no imports | safe now — remove |
| `class-variance-authority` | no imports, no `cva(` | safe now — remove |
| `tailwind-merge` | no imports | safe now — remove |
| `docs/NEON_MIGRATION_PLAN.md` etc. (older plans) | superseded by this audit + implementation reality | consolidate later (docs cleanup) |

> Removal rule (from the prompt): remove only after no imports remain, replacement works, tests + build pass. The five packages above satisfy that today; removal is a Phase 1 mechanical step.

---

## Recommended next phase (smallest high-value)

1. **Phase 1 — Hygiene (safe, today):** remove dead deps + `supabase/` folder; run lint/tsc/test/build.
2. **Phase 1b — Security polish:** rate limiting on public POSTs (no external service needed for a simple in-process or DB-backed limiter).
3. **Phase 6 — Testing:** add Playwright E2E for the two critical journeys + optional Neon integration test suite behind a CI secret.
4. **Feature options (decide with product):** feedback flow (schema ready) · blood type capture.

Detailed sequencing: see `docs/STACK_UPGRADE_PLAN.md`.
