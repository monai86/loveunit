# Neon PostgreSQL + Drizzle ORM + Better Auth Migration Plan

**System:** MUMT Blood Donation 2026 Registration & Event Management System  
**Target Architecture:** Next.js App Router → Server Actions/Route Handlers → Better Auth & Server RBAC → Drizzle ORM → Neon PostgreSQL  
**Author:** Senior Full-Stack & Database Architect  

---

## 1. Migration Overview & Architectural Transformation

| Component | Current (Supabase) | Target (Neon + Drizzle + Better Auth) | Risk / Complexity |
|---|---|---|---|
| **Database** | Supabase Managed PostgreSQL | **Neon Serverless PostgreSQL** | Low — Standard PostgreSQL engine |
| **ORM / Data Layer** | Supabase JS Client & Raw RPC | **Drizzle ORM + drizzle-kit** | Medium — Rewrite DB access layer to type-safe Drizzle queries |
| **Authentication** | Supabase Auth (`auth.users`) | **Better Auth (Drizzle Adapter)** | Medium — Migrate session management & user tables |
| **Authorization** | Supabase RLS Policies | **Server-side RBAC Guards (`lib/auth/server.ts`)** | Low — Reusable server-side guards already in place |
| **Atomic Registration RPC** | PostgreSQL `SECURITY DEFINER` RPC | **Drizzle Transaction (`db.transaction`) with `FOR UPDATE` lock** | Medium — Enforce capacity lock & duplicate prevention inside Drizzle transaction |
| **Frontend UX** | React UI & Next.js App Router | **Preserved 100% Unchanged** | Low — Existing pages consume server API endpoints |

---

## 2. Table Schema Mapping

| Entity | Drizzle Table (`db/schema/*`) | Key Columns & Constraints |
|---|---|---|
| **`events`** | `db/schema/events.ts` | `id` (UUID PK), `slug` (Unique), `start_at`, `end_at`, `venue_name`, `venue_detail`, `status` |
| **`time_slots`** | `db/schema/events.ts` | `id` (UUID PK), `event_id` (FK), `start_at`, `end_at`, `capacity`, `booked_count`, `is_active` |
| **`registrations`** | `db/schema/registrations.ts` | `id` (UUID PK), `event_id` (FK), `slot_id` (FK), `registration_code`, `qr_token`, `phone_normalized`, Unique index `(event_id, phone_normalized)` |
| **`staff_profiles`** | `db/schema/staff.ts` | `user_id` (PK, links to `users.id`), `display_name`, `role` (`STAFF`, `TEAM_LEAD`, `ADMIN`, `SUPER_ADMIN`), `team`, `is_active` |
| **`event_content_blocks`** | `db/schema/content.ts` | `id` (UUID PK), `event_id` (FK), `content_key`, `title`, `description`, `image_url`, `is_visible`, `display_order` |
| **`checkin_events`** | `db/schema/audit.ts` | `id` (UUID PK), `event_id` (FK), `registration_id` (FK), `action`, `performed_by` |
| **`audit_logs`** | `db/schema/audit.ts` | `id` (UUID PK), `actor_id`, `action`, `entity_type`, `entity_id`, `metadata` (JSONB) |
| **Better Auth Tables** | `db/schema/auth.ts` | `user`, `session`, `account`, `verification` (Standard Better Auth schema) |

---

## 3. Migration Roadmap by Phase

### Phase 0: Audit & Foundation Setup (Current)
- Audit all Supabase references.
- Create `docs/NEON_MIGRATION_PLAN.md` and `docs/HUMAN_ACTIONS.md`.

### Phase 1: Neon Connection & Drizzle ORM Setup
- Install `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `better-auth`.
- Create `drizzle.config.ts`, `db/client.ts`, `db/index.ts`, and Drizzle schemas (`db/schema/*`).
- Create initial Drizzle migration scripts and database seed (`db/seed.ts`).

### Phase 2: Core Data Services (`services/*`)
- Implement `services/event-service.ts`: Event and slot queries.
- Implement `services/registration-service.ts`: Atomic Drizzle transaction for registration (`db.transaction` with `FOR UPDATE` capacity lock & duplicate phone check).
- Implement `services/checkin-service.ts`: Donor check-in, search, and walk-in handling.

### Phase 3: Better Auth & RBAC Integration
- Configure Better Auth instance (`lib/auth/index.ts`) with Drizzle adapter.
- Link Better Auth user identity to `staff_profiles`.
- Update server authorization guards (`lib/auth/server.ts`) to verify Better Auth session cookies.

### Phase 4: Operational Features & API Route Handlers
- Connect `/api/events/[slug]/slots`, `/api/events/[slug]/register`, `/api/registrations/[code]`.
- Connect staff API routes `/api/staff/checkin`, `/api/staff/search`, `/api/staff/walk-in`.
- Connect admin API routes `/api/admin/dashboard`, `/api/admin/registrations`, `/api/admin/export`, `/api/admin/content`.

### Phase 5: Content PR & Infographic Persistence
- Connect `/admin/content` to Drizzle-backed content service.
- Preserve infographic slot placeholders on public pages.

### Phase 6: Automated Testing, Supabase Removal & Verification
- Update integration tests (`tests/production_hardening.test.ts`) to run against Neon / Drizzle.
- Clean up `@supabase/supabase-js`, `@supabase/ssr`, `lib/supabase/*`, and Supabase SQL migration files.
- Run `npm test` and `npx next build` verification.

---

## 4. Preserved Frontend Components (0% UX Rewrite)
- `app/page.tsx` (Landing Page & Hero)
- `app/register/page.tsx` (3-Step Registration Form & Slot Picker)
- `app/registration/[code]/page.tsx` (QR Digital Pass & Confirmation)
- `app/location/page.tsx` & `app/prepare/page.tsx` (Venue & Donor Guide)
- `app/staff/checkin/page.tsx`, `app/staff/walk-in/page.tsx`, `app/staff/login/page.tsx` (Staff Portal)
- `app/admin/page.tsx`, `app/admin/registrations/page.tsx`, `app/admin/content/page.tsx` (Admin Dashboard)
