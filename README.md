# MUMT Blood Donation 2026 — Registration & Event Management System
**“เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9”**

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=postgresql)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?logo=drizzle)
![Better Auth](https://img.shields.io/badge/Better_Auth-1.6-black)

A production-ready, mobile-first web application designed for university blood donation events. Built for **Faculty of Medical Technology, Mahidol University (MUMT)** in collaboration with the **Regional Blood Centre 4, Ratchaburi (Thai Red Cross)**.

---

## 📅 Official Event Metadata (Source of Truth)
- **Event Name:** MUMT Blood Donation 2026 “เติมรักให้เต็ม Unit ต่อชีวิตด้วยโลหิตคุณ ครั้งที่ 9”
- **Organizer:** คณะเทคนิคการแพทย์ มหาวิทยาลัยมหิดล ร่วมกับ ภาคบริการโลหิตแห่งชาติที่ 4 จังหวัดราชบุรี (Faculty of Medical Technology, Mahidol University & Regional Blood Centre 4, Ratchaburi)
- **Date:** วันพุธที่ 16 กันยายน 2569 (Wednesday, 16 September 2026)
- **Time:** 09:00 – 14:00 น. (9:00 AM – 2:00 PM)
- **Venue:** ห้องประชุม 217 อาคารสิริวิทยา คณะศิลปศาสตร์ มหาวิทยาลัยมหิดล วิทยาเขตศาลายา (Meeting Room 217, Sirividhaya Building, Faculty of Liberal Arts, Mahidol University, Salaya Campus)

---

## 🏗 Architecture & Stack
- **Frontend:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Lucide React icons
- **Backend:** Next.js Server Components, Route Handlers, Application Service Layer (`services/*`)
- **Database:** Neon Serverless PostgreSQL
- **ORM & Migrations:** Drizzle ORM + drizzle-kit (`drizzle.config.ts`, `db/schema/*`)
- **Authentication:** Better Auth (`better-auth`) with Drizzle adapter
- **Validation:** Zod schemas
- **Email:** Nodemailer (SMTP) — transactional confirmation emails

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

---

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose | Required |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `BETTER_AUTH_SECRET` | Better Auth signing secret (≥32 chars) | ✅ |
| `BETTER_AUTH_URL` | Public URL of the app (e.g. `https://your-domain.com`) | ✅ |
| `NEXT_PUBLIC_APP_URL` | Public base URL (used for links in emails) | ✅ |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | SMTP server for confirmation emails | only for email |
| `SMTP_FROM` | Sender address for confirmation emails | only for email |

Email is a **silent no-op** when SMTP is not configured — registrations never fail because of email.

---

## 📬 Registration Confirmation Email

On successful online registration, a confirmation email is sent (when SMTP is configured) containing:
the registration code, arrival time slot, venue, pre-donation checklist, and a link to the QR pass page.

---

## 🐳 Deployment

### Docker

The repo ships a multi-stage `Dockerfile` using Next.js **standalone output**
(`output: "standalone"` in `next.config.ts`) — no build-time database access required.

```bash
# Build the image
docker build -t loveunit .

# Run it (pass secrets at runtime)
docker run -p 3000:3000 --env-file .env.local loveunit
```

### CI

`.github/workflows/ci.yml` runs on every push/PR to `main`: **lint → typecheck → unit tests → production build**.

### Deploying to a host

1. Provision a PostgreSQL (Neon) database and run migrations: `npm run db:push`.
2. Set the environment variables from the table above on the host.
3. Examples:
   - **Railway / Fly.io:** deploy the Dockerfile directly and attach the env vars.
   - **Vercel:** import the repo and set the env vars; the default build command works out of the box.

### Data & migrations

- Schema lives in `db/schema/*`; generate a migration with `npm run db:generate`, then apply with `npm run db:push`.
- `db/seed.ts` seeds the official event metadata and time slots (idempotent).

---

## 🧭 Public pages
- `/` — homepage (hero, donor journey, preparation checklist)
- `/register` — 3-step online registration wizard
- `/lookup` — recover a forgotten QR code (phone + name verification)
- `/registration/[code]` — registration pass with QR code
- `/prepare`, `/location` — donor guides
- `/staff/*` — staff check-in, walk-in registration (auth required)
- `/admin/*` — admin dashboard, registrations, content management (auth required)
