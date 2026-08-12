# MUMT Blood Donation 2026 — Implementation Plan

**Event Name:** MUMT Blood Donation 2026 “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9”  
**Stack:** Next.js (App Router, Server Actions/Route Handlers, TS), Tailwind CSS + shadcn/ui, Supabase (PostgreSQL + Auth + RLS), Zod.

---

## 1. System Overview & Scope

The application is a mobile-first, reliable event management and registration platform supporting:
1. **Public Donors:** Landing page, event details, replaceable infographics, 3-step registration form, arrival time-slot selection (capacity-safe), instant registration confirmation & QR pass, location & preparation guides.
2. **Staff Operations:** Mobile/tablet QR code scanner & manual search check-in, 30-second fast walk-in registration.
3. **Admin & Team Lead:** Dashboard with real-time KPIs (pre-event forecast, live event check-ins, post-event analytics), slot management, registration management, CSV/Excel export, audit logs, and content block management.

**Non-Goals:** No medical eligibility screening, diagnostic logic, or institutional privacy/medical assumptions.

---

## 2. Proposed Database Schema (Supabase PostgreSQL + RLS)

### Enums
- `participant_type_enum`: `STUDENT`, `STAFF`, `GENERAL_PUBLIC`
- `donation_experience_enum`: `FIRST_TIME`, `RETURNING`
- `registration_source_enum`: `ONLINE`, `WALK_IN`, `ADMIN`
- `registration_status_enum`: `REGISTERED`, `CHECKED_IN`, `IN_PROCESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
- `staff_role_enum`: `STAFF`, `TEAM_LEAD`, `ADMIN`, `SUPER_ADMIN`
- `event_status_enum`: `DRAFT`, `PUBLISHED`, `REGISTRATION_OPEN`, `REGISTRATION_CLOSED`, `COMPLETED`, `ARCHIVED`

### Tables
1. **`events`**
   - `id` (UUID, PK)
   - `slug` (TEXT, UNIQUE)
   - `name` (TEXT), `short_name` (TEXT)
   - `description` (TEXT)
   - `start_at` (TIMESTAMPTZ), `end_at` (TIMESTAMPTZ)
   - `venue_name` (TEXT), `venue_detail` (TEXT)
   - `registration_open_at` (TIMESTAMPTZ), `registration_close_at` (TIMESTAMPTZ)
   - `status` (`event_status_enum`)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

2. **`event_content_blocks`**
   - `id` (UUID, PK)
   - `event_id` (UUID, FK -> events.id)
   - `content_key` (TEXT) — e.g. `hero_poster`, `location_infographic`, `transportation_infographic`, `preparation_infographic`, `booth_infographic`, `sponsor_banner`
   - `title` (TEXT), `description` (TEXT, Nullable)
   - `image_url` (TEXT, Nullable)
   - `alt_text` (TEXT, Nullable)
   - `display_order` (INT)
   - `is_visible` (BOOLEAN)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

3. **`time_slots`**
   - `id` (UUID, PK)
   - `event_id` (UUID, FK -> events.id)
   - `start_at` (TIMESTAMPTZ), `end_at` (TIMESTAMPTZ)
   - `capacity` (INT)
   - `booked_count` (INT, default 0)
   - `is_active` (BOOLEAN)
   - `created_at` (TIMESTAMPTZ)

4. **`registrations`**
   - `id` (UUID, PK)
   - `event_id` (UUID, FK -> events.id)
   - `registration_code` (TEXT, UNIQUE) — format `MBD26-XXXXXX`
   - `qr_token` (TEXT, UNIQUE) — secure opaque random hash
   - `first_name` (TEXT), `last_name` (TEXT)
   - `phone` (TEXT), `phone_normalized` (TEXT) — indexed for duplicate prevention `(event_id, phone_normalized)`
   - `email` (TEXT, Nullable)
   - `participant_type` (`participant_type_enum`)
   - `faculty` (TEXT, Nullable), `academic_year` (TEXT, Nullable)
   - `donation_experience` (`donation_experience_enum`)
   - `slot_id` (UUID, FK -> time_slots.id, Nullable)
   - `status` (`registration_status_enum`, default `REGISTERED`)
   - `source` (`registration_source_enum`, default `ONLINE`)
   - `privacy_accepted` (BOOLEAN)
   - `registered_at` (TIMESTAMPTZ)
   - `checked_in_at` (TIMESTAMPTZ, Nullable)
   - `completed_at` (TIMESTAMPTZ, Nullable)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

5. **`staff_profiles`**
   - `user_id` (UUID, PK, FK -> auth.users.id)
   - `display_name` (TEXT)
   - `role` (`staff_role_enum`)
   - `team` (TEXT, Nullable)
   - `is_active` (BOOLEAN)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

6. **`checkin_events`**
   - `id` (UUID, PK)
   - `event_id` (UUID, FK -> events.id)
   - `registration_id` (UUID, FK -> registrations.id)
   - `action` (TEXT) — `CHECK_IN`, `STATUS_CHANGE`, `WALK_IN_REGISTER`
   - `performed_by` (UUID, FK -> auth.users.id)
   - `metadata` (JSONB)
   - `created_at` (TIMESTAMPTZ)

7. **`audit_logs`**
   - `id` (UUID, PK)
   - `actor_id` (UUID, Nullable)
   - `action` (TEXT) — e.g. `EXPORT_REGISTRATIONS`, `CANCEL_REGISTRATION`, `UPDATE_EVENT`
   - `entity_type` (TEXT), `entity_id` (TEXT)
   - `metadata` (JSONB)
   - `created_at` (TIMESTAMPTZ)

8. **`feedback`**
   - `id` (UUID, PK)
   - `event_id` (UUID, FK -> events.id)
   - `registration_id` (UUID, FK -> registrations.id, Nullable)
   - `rating` (INT)
   - `knowledge_rating` (INT, Nullable)
   - `experience_rating` (INT, Nullable)
   - `comment` (TEXT, Nullable)
   - `created_at` (TIMESTAMPTZ)

---

## 3. Route Map & API Endpoints

```text
/                                -> Public Landing Page
/register                        -> Multi-Step Donor Registration
/registration/[code]             -> QR Confirmation & Digital Pass
/prepare                         -> Donor Preparation & Infographics
/location                        -> Venue Location & Transport Info

/staff/login                     -> Staff Login
/staff/checkin                   -> QR Scanning & Manual Check-in
/staff/walk-in                   -> Fast Walk-in Registration

/admin                           -> Operational KPI Dashboard
/admin/registrations             -> Registration Management & Filters
/admin/event                     -> Event & Slot Management
/admin/content                   -> Infographic & Content Management
/admin/staff                     -> Staff & Role Management
```

---

## 4. Execution Strategy

1. **Phase 1 (Public MVP):** Next.js setup, Tailwind palette, database schema, landing page, infographic placeholders, multi-step registration, QR code generation.
2. **Phase 2 (Staff MVP):** Auth, staff check-in page with camera QR scanning, manual search, 30-sec walk-in.
3. **Phase 3 (Admin MVP):** Operational Dashboard, filterable registrations table, CSV/Excel export with audit logging, content manager.
4. **Phase 4 (Testing & Build Verification):** End-to-end tests, unit tests for slot concurrency safety, build verification.
