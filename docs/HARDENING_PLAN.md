# Hardening & Correction Plan — MUMT Blood Donation 2026

**Event Name:** MUMT Blood Donation 2026 “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9”  
**Author:** Senior Full-Stack Security & System Engineer  
**Date:** August 2026  

---

## 1. Executive Summary & Audit Scope

This document details the hardening pass for the MUMT Blood Donation 2026 web application. The audit verified security, data integrity, system boundaries, and event metadata accuracy against official requirements.

---

## 2. Confirmed Issues & Hardening Matrix

| ID | Issue Description | Severity | Affected File(s) | Proposed Fix | Verification Method |
|---|---|---|---|---|---|
| **P0-1** | **Incorrect Event Information Across Codebase**<br>Stale date (`18 Sep 2026`), time (`08:30–15:30`), and venue hardcoded across files. | **P0 Critical** | `supabase/seed.sql`<br>`lib/db/store.ts`<br>`app/page.tsx`<br>`app/register/page.tsx`<br>`app/registration/[code]/page.tsx`<br>`app/location/page.tsx`<br>`app/prepare/page.tsx`<br>`tests/registration.test.ts` | Update single source of truth (`events` record) to official date (**16 September 2026 / 16 กันยายน 2569**), time (**08:00–15:00**), and venue (**ห้องประชุม 217 และ 218 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล ศาลายา**). All UIs must derive values dynamically from event model. | Unit tests & UI inspection |
| **P0-2** | **Supabase RLS Security Flaw on `registrations`**<br>`USING (TRUE)` SELECT and `WITH CHECK (TRUE)` INSERT allowed direct public database bypass. | **P0 Critical** | `supabase/migrations/20260101000000_initial_schema.sql`<br>`docs/SECURITY_AND_PRIVACY.md` | Revoke all direct public SELECT/INSERT policies on `registrations`. All public operations must go through trusted server-side API endpoints (`/api/registrations/[code]`, `/api/events/[slug]/register`) using service role / SECURITY DEFINER procedures. | RLS policy audit & API endpoint tests |
| **P0-3** | **Production Silent Fallback to In-Memory Storage**<br>App silently fell back to memory array if Supabase credentials were missing in production. | **P0 Critical** | `lib/db/store.ts`<br>`app/api/events/[slug]/register/route.ts`<br>`.env.example` | Require explicit `DATA_BACKEND=memory` for dev/test. In `production` environment (`NODE_ENV === 'production'`), if database is unconfigured, fail closed with controlled 503 Service Unavailable error. | Environment switch test |
| **P0-4** | **Event Lookup Bug (`getEventBySlug`)**<br>Returned `defaultEvent` for arbitrary unknown slugs. | **P0 Critical** | `lib/db/store.ts`<br>`app/api/events/[slug]/slots/route.ts` | Fix lookup: Unknown event slugs must return `null` and render HTTP 404 Not Found. | API 404 test for unknown slug |
| **P1-1** | **Registration State Machine Transition Controls**<br>Unchecked status transitions (e.g. `COMPLETED → REGISTERED`). | **P1 High** | `lib/db/store.ts`<br>`app/api/staff/checkin/route.ts` | Enforce strict state transitions: `REGISTERED → CHECKED_IN`, `CHECKED_IN → IN_PROCESS`, `IN_PROCESS → COMPLETED`, `REGISTERED → CANCELLED`. | State machine unit tests |
| **P1-2** | **Unapproved Public Content Cleanup**<br>Invented claims (e.g. guaranteed souvenirs, e-certificates). | **P1 High** | `app/page.tsx`<br>`app/prepare/page.tsx` | Clean up invented claims. Replace with neutral placeholders backed by `event_content_blocks`. | UI content inspection |
| **P1-3** | **Database Indexing & Schema Completeness**<br>Missing explicit indexes for slug, qr_token, phone_normalized. | **P1 High** | `supabase/migrations/20260101000000_initial_schema.sql` | Add clean indexes for `events(slug)`, `time_slots(event_id, start_at)`, `registrations(qr_token)`, `registrations(status)`. | Schema migration inspection |
| **P2-1** | **Integration Test Suite Coverage**<br>Lacked explicit tests for fail-closed behavior, state machine, and RLS. | **P2 Medium** | `tests/registration.test.ts` | Expand `tests/registration.test.ts` to cover all hardening requirements. | `npm test` execution |

---

## 3. Incremental Execution Strategy

1. **Step 1:** Fix P0-1 (Event info single source of truth update).
2. **Step 2:** Fix P0-2 (Supabase RLS hardening - revoke public direct access).
3. **Step 3:** Fix P0-3 & P0-4 (Fail-closed production mode & event slug 404 bug).
4. **Step 4:** Fix P1-1 & P1-2 (State machine transitions & unapproved content cleanup).
5. **Step 5:** Fix P1-3 & P2-1 (Migration indexing quality & expanded automated test suite).
6. **Step 6:** Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` verification.
