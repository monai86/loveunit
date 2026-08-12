# System Architecture — MUMT Blood Donation 2026

## Overview
The **MUMT Blood Donation 2026** platform is built on Next.js App Router (TypeScript) using a serverless-ready architecture. It supports a high-throughput public registration experience and mobile staff operations during university blood donation events.

```text
[ Public Donors ] -------> [ Next.js App Router (Public Routes) ]
                                   │
                                   ▼
[ Staff & Admins ] -------> [ Next.js App Router (Staff / Admin) ]
                                   │
                                   ▼
                        [ Data Access Layer (store.ts) ]
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
     [ Supabase PostgreSQL + RLS ]         [ In-Memory Fallback ]
     (register_donor_atomic Stored Proc)    (Development / Offline)
```

## Core Components
1. **Multi-Step Form (`/register`):** Client-side state machine with Zod validation, instant field feedback, and capacity indicators.
2. **Atomic Registration Engine (`register_donor_atomic`):** PostgreSQL stored procedure using row-level locking (`FOR UPDATE`) to eliminate race conditions under concurrent slot bookings.
3. **QR Digital Pass (`/registration/[code]`):** Opaque signed token rendered as high-contrast SVG QR Code.
4. **Staff Check-In Engine (`/staff/checkin`):** Dual mode camera QR scanner (`html5-qrcode`) and manual multi-field lookup (Code, Name, Phone).
5. **Walk-In Registration Engine (`/staff/walk-in`):** 20-30 second streamlined registration and auto-checkin.
6. **Analytics & KPI Engine (`/admin`):** Real-time aggregation of pre-event arrival forecast, live check-ins, and participant demographics.
