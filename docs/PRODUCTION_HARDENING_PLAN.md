# Production Hardening Plan — MUMT Blood Donation 2026

**System Name:** MUMT Blood Donation 2026 Registration & Event Management System  
**Author:** Senior Full-Stack & Security Engineer  

---

## 1. Executive Summary & Repository Audit Findings

A rigorous source code audit of `/app`, `/lib`, `/components`, `/supabase`, and `/tests` identified critical security flaws and architectural issues:

1. **Fake Authentication (P0):** `/staff/login` stored sessions in `localStorage` and assigned roles via `email.includes('admin')`.
2. **Missing Server-Side Authorization (P0):** `/api/staff/*` and `/api/admin/*` lacked server-side role verification guards.
3. **Unprotected Privileged RPC (`register_donor_atomic`) (P0):** Function executed with `SECURITY DEFINER` without restricting `EXECUTE` permissions or setting a locked `search_path`.
4. **Walk-in Slot UUID Mismatch (P0):** `/staff/walk-in` passed string `'ts-1'` instead of valid slot UUID.
5. **Insecure QR Token Generation (P0):** `lib/utils/format.ts` used `Math.random()`.
6. **Fake Admin Persistence (P1):** `/admin/content` simulated saving with `setTimeout`.

---

## 2. Hardening Matrix

| Issue | Severity | Evidence | Files | Proposed Fix | Verification |
|---|---|---|---|---|---|
| **Fake Auth & Role Assignment** | **P0 Critical** | `localStorage.setItem` in `app/staff/login/page.tsx` line 24 | `app/staff/login/page.tsx`<br>`lib/supabase/server.ts`<br>`lib/auth/server.ts` | Replace fake auth with Supabase Auth (`signInWithPassword`) and `@supabase/ssr` cookies. Derive role strictly from `staff_profiles` DB table. | Auth integration test |
| **Missing API Authorization Guards** | **P0 Critical** | `/api/admin/*` routes lacked session/role checks | `lib/auth/server.ts`<br>`app/api/admin/*`<br>`app/api/staff/*` | Implement `requireStaff()`, `requireAdmin()`, `requireTeamLead()` server-side guards. Reject unauthorized requests with 401/403. | API security tests |
| **Unrestricted RPC Permissions** | **P0 Critical** | `register_donor_atomic` executable by PUBLIC in SQL migration | `supabase/migrations/20260101000000_initial_schema.sql` | `REVOKE EXECUTE ON FUNCTION register_donor_atomic FROM PUBLIC, anon;` `GRANT EXECUTE TO service_role;` Lock `SET search_path = public, pg_temp;`. | SQL RLS & RPC permission test |
| **Walk-in Slot UUID Mismatch** | **P0 Critical** | `slotId: 'ts-1'` hardcoded in `app/api/staff/walk-in/route.ts` line 34 | `app/api/staff/walk-in/route.ts`<br>`lib/db/store.ts` | Query active slot UUID from event database or support valid slot selection. | Walk-in API test |
| **Weak QR Token Generation** | **P0 Critical** | `Math.random()` in `lib/utils/format.ts` line 30 | `lib/utils/format.ts` | Replace with `crypto.randomUUID()` / `crypto.randomBytes()`. | QR generator test |
| **Registration Window Enforcement** | **P1 High** | Unchecked registration dates in registration endpoint | `app/api/events/[slug]/register/route.ts`<br>`lib/db/store.ts` | Check `now >= registration_open_at AND now <= registration_close_at AND status IN ('REGISTRATION_OPEN', 'PUBLISHED')`. | Registration window unit test |
| **Fake Admin Content Persistence** | **P1 High** | `setTimeout` in `app/admin/content/page.tsx` line 44 | `app/admin/content/page.tsx`<br>`app/api/admin/content/route.ts` | Implement real DB CRUD API `/api/admin/content` updating `event_content_blocks`. | Content update test |
| **Fabricated Medical Content Removal** | **P1 High** | Unapproved claims in `app/page.tsx` | `app/page.tsx`<br>`app/prepare/page.tsx` | Replace unapproved text with neutral placeholders backed by `event_content_blocks`. | Content audit |

---

## 3. Execution Order & Handoff Points

1. **Step 1:** Implement Supabase Auth Server Helpers & Database Client Separation (`lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/auth/server.ts`).
2. **Step 2:** Replace fake `localStorage` auth in `/staff/login` and protect `/staff/*` and `/admin/*`.
3. **Step 3:** Implement Server Authorization Guards (`requireStaff()`, `requireAdmin()`) on all `/api/staff/*` and `/api/admin/*` API endpoints.
4. **Step 4:** Harden PostgreSQL Migration & `register_donor_atomic` RPC permissions (`REVOKE EXECUTE FROM PUBLIC`, locked `search_path`, indexes).
5. **Step 5:** Fix Walk-in Slot UUID handling and Cryptographically Secure QR Tokens (`crypto.randomUUID()`).
6. **Step 6:** Implement Real Admin Content Persistence API (`/api/admin/content`).
7. **Step 7:** Enforce Registration Window (`registration_open_at` / `registration_close_at`).
8. **Step 8:** Add Database Integration Test Suite & E2E Test Suite.
