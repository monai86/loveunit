# MUMT Blood Donation 2026 — Registration & Event Management System
**“เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9”**

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=postgresql)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?logo=drizzle)
![Better Auth](https://img.shields.io/badge/Better_Auth-1.6-black)

A production-ready, mobile-first web application designed for university blood donation events. Built for **Faculty of Medical Technology, Mahidol University (MUMT)** in collaboration with the **Thai Red Cross Society**.

---

## 📅 Official Event Metadata (Source of Truth)
- **Event Name:** MUMT Blood Donation 2026 “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9”
- **Date:** วันพุธที่ 16 กันยายน 2569 (16 September 2026)
- **Time:** 08:00 – 15:00 น.
- **Venue:** ห้องประชุม 217 และ 218 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล วิทยาเขตศาลายา

---

## 🏗 Architecture & Stack
- **Frontend:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Lucide React icons
- **Backend:** Next.js Server Components, Route Handlers, Application Service Layer (`services/*`)
- **Database:** Neon Serverless PostgreSQL
- **ORM & Migrations:** Drizzle ORM + drizzle-kit (`drizzle.config.ts`, `db/schema/*`)
- **Authentication:** Better Auth (`better-auth`) with Drizzle adapter
- **Validation:** Zod schemas

---

## 🚀 Quick Start & Testing

```bash
# Install dependencies
npm install

# Run Drizzle schema migration generator
npm run db:generate

# Apply Drizzle migrations to database
npm run db:push

# Run automated test suites
npm test

# Run Next.js production SSG build verification
npx next build
```
