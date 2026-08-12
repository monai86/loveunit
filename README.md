# MUMT Blood Donation 2026 — Registration & Event Management System
**“เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9”**

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)

A production-ready, mobile-first web application designed for university blood donation events. Built for **Faculty of Medical Technology, Mahidol University (MUMT)** in collaboration with the **Thai Red Cross Society**.

---

## 📅 Official Event Metadata (Source of Truth)
- **Event Name:** MUMT Blood Donation 2026 “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9”
- **Date:** วันพุธที่ 16 กันยายน 2569 (16 September 2026)
- **Time:** 08:00 – 15:00 น.
- **Venue:** ห้องประชุม 217 และ 218 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล วิทยาเขตศาลายา

---

## 🌟 Key Features

### 1. Public Donor Journey
- **Landing Page (`/`):** Hero section, event overview, venue info, and PR infographics.
- **Infographic Slots (`InfographicSlot`):** Clean fallback placeholders ("Infographic coming soon") for PR/media artwork.
- **Multi-Step Registration (`/register`):** 3-step form with phone normalization and duplicate prevention (`event_id + normalized_phone`).
- **Arrival Time Slot Picker:** Capacity indicators (*Available*, *Nearly full*, *Full*) with explicit disclaimer (*"เวลาที่เลือกเป็นช่วงเวลาที่แนะนำให้เดินทางมาถึง ไม่ใช่เวลารับบริจาคที่รับประกัน"*).
- **QR Digital Pass (`/registration/[code]`):** Opaque signed QR tokens resolved server-side without embedding PII.
- **Preparation & Location (`/prepare`, `/location`):** Donor guidelines, travel modes, and maps for Sirividhya Building.

### 2. Staff Operations
- **Staff Portal (`/staff/login`):** Role-based authentication.
- **QR Check-in & Lookup (`/staff/checkin`):** Camera QR scanner + manual search by code/name/phone.
- **Ultra-Fast Walk-in (`/staff/walk-in`):** 20-30 second registration & auto-checkin form.

### 3. Admin & Team Lead Dashboard
- **Operational Dashboard (`/admin`):** Real-time pre-event arrival forecast, live check-ins, and participant demographics.
- **Registration Management (`/admin/registrations`):** Filterable data table with search.
- **Audit-Logged Data Export (`/api/admin/export`):** One-click Excel `.xlsx` export with audit logging.
- **Content Manager (`/admin/content`):** Dynamic infographic and title editor for PR teams without code edits.

---

## 🛡 Privacy & Security
- **Hardened Supabase RLS:** Direct public SELECT and INSERT on `registrations` are strictly revoked. Public operations occur exclusively through trusted server-side API endpoints.
- **No PII in QR Codes:** QR tokens are cryptographic opaque strings resolved on the server.
- **Minimal Data Collection:** No National ID, address, or medical history collected.
- **Non-Diagnostic System:** Purely for arrival forecasting and event operations. Medical eligibility screening is handled exclusively by Thai Red Cross staff on-site.
- **Fail-Closed Production Storage:** Memory storage is forbidden in production unless explicitly configured with `DATA_BACKEND=memory`.

---

## 🚀 Quick Start & Testing

```bash
# Install dependencies
npm install

# Run automated test suite
npm test

# Run Next.js production build verification
npx next build
```
