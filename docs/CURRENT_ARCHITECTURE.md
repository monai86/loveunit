# Current Architecture — MUMT Blood Donation 2026

> Verified from source (August 2026). This describes what exists **today**, not the target.

---

## 1. High-Level Diagram

```text
Browser (React 19 / Next.js App Router)
   │  public pages: /, /register, /lookup, /prepare, /location, /registration/[code]
   │  staff/admin: /staff/login, /staff/(portal)/*, /admin/*
   │  PWA: manifest.ts + /sw.js (offline shell + offline action queue)
   ▼
Next.js 16 (Node runtime, `output: standalone`)
   │
   ├── Server Components (layouts, public pages)
   ├── Client Components ('use client' — register wizard, staff tools, admin panels)
   ├── Route Handlers (app/api/*) — the only data-access surface
   │      public:   /api/events/[slug]/slots|register|waitlist, /api/registrations/lookup|/[code]
   │      staff:    /api/staff/checkin|search|queue|walk-in|stats      (requireStaff)
   │      admin:    /api/admin/* (dashboard, registrations, export, content, waitlist, audit-logs) (requireAdmin/TeamLead)
   │      auth:     /api/auth/* (Better Auth) + /api/auth/me, /api/auth/complete-password-change
   │
   ├── Server Guards (lib/auth/server.ts): requireStaff/TeamLead/Admin/SuperAdmin
   ├── Zod validation (lib/validation/schemas.ts) — re-validated server-side on every write
   ├── Application Service Layer (services/*) — the only layer that touches data
   │      event, registration, checkin, queue, waitlist, content, admin, audit, email
   │      (each branches: Drizzle/Neon when real DB, in-memory store when allowed)
   │
   └── Data access
          ├── Drizzle ORM (db/schema/* → db/migrations/* via drizzle-kit)
          └── Neon PostgreSQL (@neondatabase/serverless Pool, server-only DATABASE_URL)
```

---

## 2. Request Flow — Public Registration (walked through live)

```text
Browser POST /api/events/mumt-2026/register  {formData + slotId}
   → Zod safeParse (publicRegistrationSchema)          [security gate #1]
   → services/registration-service.registerDonor()
        → checks event window, slot capacity (transaction, FOR UPDATE),
          duplicate phone (unique index), generates code + QR token
   → Drizzle transaction on Neon
   → email-service.sendRegistrationConfirmation()       [no-op if SMTP unset]
   → 200 { registrationCode } → browser redirects to /registration/[code]
```

---

## 3. Request Flow — Staff Check-in

```text
Browser (staff tablet) POST /api/staff/checkin  {registrationCode | token}
   → requireStaff() server guard                     [security gate]
   → services/checkin-service.updateRegistrationStatus(..., performedBy)
        → state machine (isTransitionAllowed) + Drizzle transaction
        → writes checkin_events (audit trail, actor = resolved session user)
   → returns updated registration
```

---

## 4. Request Flow — Staff Auth

```text
/staff/login (client) → authClient.signIn.email() → /api/auth/sign-in/email (Better Auth)
   → session cookie (httpOnly) + origin/CSRF checks
   → /api/auth/me returns { user, profile(role), mustChangePassword }
   → if mustChangePassword → /staff/change-password (complete-password-change API clears flag)
   → else redirect by role: ADMIN → /admin, STAFF/TEAM_LEAD → /staff/checkin
Pages /staff/(portal)/* and /admin/* are server layouts that call getAuthenticatedUser()
   and redirect() when there is no session / wrong role / pending password change.
```

---

## 5. Data Layer Split (dual backend)

```text
services/*  ──►  isMemoryBackendAllowed() ?
                   ├─ YES → lib/db/store.ts (in-memory arrays, snake_case types)
                   └─ NO  → Drizzle (db/*) → Neon
```

- `isMemoryBackendAllowed()` = `DATA_BACKEND === 'memory'` **or** `NODE_ENV ∈ {test, development}`.
- Production without `DATA_BACKEND=memory` → **fail closed** (services throw), verified by tests.
- Auth (Better Auth) always uses the real Neon adapter when `DATABASE_URL` is set — auth is never in-memory in production.
- This split is why `lib/types/database.ts` (snake_case, memory shapes) coexists with Drizzle types (camelCase). Normalizers bridge the two.

---

## 6. Component Map

| Area | Files |
| --- | --- |
| Root layout | `app/layout.tsx` (Navbar, StaffHeader, OfflineBanner, Footer, MobileBottomNav, SW register) |
| Public pages | `app/page.tsx`, `/register`, `/lookup`, `/prepare`, `/location`, `/registration/[code]` |
| Staff | `/staff/login`, `/staff/change-password`, `/staff/(portal)/checkin|queue|walk-in` |
| Admin | `/admin` (dashboard), `/admin/registrations`, `/admin/content`, `/admin/audit-logs` |
| Shared UI | `components/ui/TicketStub.tsx`, `components/infographic/InfographicSlot.tsx` |
| Layout | `components/layout/{Navbar,Footer,MobileBottomNav,StaffHeader}.tsx` |
| PWA | `components/pwa/{ServiceWorkerRegister,OfflineBanner}.tsx`, `lib/pwa/offline-queue.ts`, `public/sw.js` |
| Admin panels | `components/admin/WaitlistPanel.tsx` |

---

## 7. Current Technology Decisions (as-built)

| Area | Decision in code today |
| --- | --- |
| Framework | Next.js App Router, React 19, no Server Actions (API routes) |
| Styling | Tailwind v4 + custom "Warm Editorial Blood Drive" system |
| Forms | manual `useState` + Zod server validation |
| DB | Neon + Drizzle, dual memory backend for dev/test |
| Auth | Better Auth + RBAC guards + forced first-login password change |
| Email | nodemailer/SMTP, silent no-op when unconfigured |
| Anti-bot | none |
| Export | real .xlsx (2 sheets) |
| Offline | PWA shell + offline action queue for staff check-in |
| Deploy | standalone Docker image, CI on GitHub Actions |

---

## 8. Notes / Known Structural Friction

1. **Dual type shapes** (snake_case memory vs camelCase Drizzle) — normalizers needed at boundaries. Works, adds noise.
2. **Admin dashboard + staff stats** compute KPIs in JS from a registrations fetch (fine at this scale; could become SQL aggregate later).
3. **No middleware.ts** — gating lives in layouts + route guards. Fine; a middleware cookie pre-check is optional.
4. **`feedback` table has no code path** yet.
5. **Local dev prefers memory backend** for business data even with a live `DATABASE_URL`; only auth/seed hit Neon locally.
