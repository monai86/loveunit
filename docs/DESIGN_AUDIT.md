# MUMT Blood Donation 2026 — UI/UX Design Audit (`docs/DESIGN_AUDIT.md`)

## Executive Summary
This document audits the visual and user experience architecture of **MUMT Blood Donation 2026**.
The audit evaluates current layouts, identifies generic AI/SaaS design clichés, highlights responsive weaknesses across Mobile (375px), Tablet (768px - 1024px), and Desktop (1280px+), and outlines specific design refinements required to transition to the **“Warm Editorial Blood Drive”** visual language.

---

## 1. Route-by-Route UX & Visual Audit

### 1.1 Public Homepage (`app/page.tsx`)
- **Current Purpose:** Primary event landing page introducing MUMT 2026, date, time, venue, poster infographic, and registration CTAs.
- **Current Layout:** Centered hero section with floating badges and uniform card sections.
- **UX & Visual Defects:**
  - Standard centered SaaS template hero layout without visual tension or strong art direction.
  - Symmetrical 3-card event facts grid (`Date`, `Time`, `Venue`) that feels repetitive.
  - Uniform section spacing (`space-y-10`) without editorial rhythm.
- **Remediation Strategy:**
  - Redesign as an asymmetric editorial campaign poster layout with oversized typography (`เติมรักให้เต็ม UNIT`).
  - Replace generic 3-card grid with bold typographic event facts (`16 / SEP`, `08:00—15:00`, `217+218`).
  - Introduce `UNIT 01` through `UNIT 05` structural markers for section rhythm.
  - Alternating layout composition for infographic sections.

### 1.2 Public Online Registration (`app/register/page.tsx`)
- **Current Purpose:** Multi-step registration wizard for donors to select participant type, faculty, academic year, and arrival time slot.
- **Current Layout:** Centered progress bar with step panels inside a single large card.
- **UX & Visual Defects:**
  - Identical pill buttons for time slot selection that blend together on mobile screens.
  - Step indicator pills that lack a strong editorial layout hierarchy.
- **Remediation Strategy:**
  - Desktop / Tablet Landscape: Asymmetric 2-column layout (Left: Step index & helpful guidance; Right: Clean form controls).
  - Mobile: Clean progress bar (`ขั้นตอน 1 จาก 3`) with persistent labels.
  - Time Slots: Redesign as a timetable list (`08:00 | 12 spots left`) with clear selected state indicators.

### 1.3 Digital Pass Confirmation (`app/registration/[code]/page.tsx`)
- **Current Purpose:** Displays opaque QR token, registration code, participant details, and print options.
- **Current Layout:** Standard card container with centered QR image.
- **UX & Visual Defects:**
  - Looks like a generic success alert rather than a memorable event visual artifact.
- **Remediation Strategy:**
  - Redesign into a **Registration Ticket / Event Pass** visual artifact (`MUMT BLOOD DONATION 2026 PASS`) inspired by boarding passes and donor unit labels.

### 1.4 Preparation Guide (`app/prepare/page.tsx`) & Location (`app/location/page.tsx`)
- **Current Purpose:** Educate donors on preparation steps and provide venue & transportation directions.
- **Current Layout:** Uniform card grids.
- **UX & Visual Defects:**
  - Repetitive card boxes with icons next to every title.
- **Remediation Strategy:**
  - Transform into an editorial publication guide with clear typographic hierarchy and alternating image placement.

### 1.5 Staff Portal (`app/staff/login/page.tsx`, `app/staff/checkin/page.tsx`, `app/staff/walk-in/page.tsx`)
- **Current Purpose:** Fast event-day check-in scanner and walk-in registration.
- **Current Layout:** Generic form and list views.
- **UX & Visual Defects:**
  - Not optimized specifically for iPad landscape or fast single-hand mobile operation.
- **Remediation Strategy:**
  - Redesign as a **Fast / Operational / High-Contrast** interface.
  - iPad Landscape: 2-column operational layout (Left: Camera scanner / Search; Right: Registration detail & 1-tap Check-in button).
  - Walk-in: High-speed form with large tap targets.

### 1.6 Admin Dashboard (`app/admin/page.tsx`, `app/admin/registrations/page.tsx`, `app/admin/content/page.tsx`)
- **Current Purpose:** Real-time event analytics, donor management, CSV exports, and content management.
- **Current Layout:** Standard KPI cards and data table.
- **UX & Visual Defects:**
  - KPI cards use generic SaaS formatting.
- **Remediation Strategy:**
  - Redesign as a **Dense / Analytical / Controlled** management center with prominent metric scale and high-density data tables.

---

## 2. Identified Global Design Flaws to Eliminate
1. **Generic AI SaaS Patterns:** Centered heroes, floating particles, glassmorphism, glowing gradient blobs.
2. **Excessive Rounding:** Over-rounded `3xl` containers on every single card.
3. **Card Wall Layouts:** Wrapping every piece of text inside identical rounded cards.
4. **Icon Overuse:** Placing a circular Lucide icon next to every heading.
5. **Uniform Spacing:** Identical vertical padding across every section without editorial rhythm.

---

## 3. Preserved Functionality Checklist
- ✅ Drizzle ORM + Neon Database Schema & Queries
- ✅ Better Auth RBAC Server Guards (`requireStaff()`, `requireAdmin()`)
- ✅ Event Time Slot Capacity & Atomic Booking Logic
- ✅ Cryptographically Secure Opaque QR Token Generation & Lookup
- ✅ Hardening Unit Test Suite (`npm test` 14/14 tests)
