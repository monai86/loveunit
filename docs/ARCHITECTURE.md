# System Architecture — MUMT Blood Donation 2026

## Target Stack & Architecture

```text
Browser Client
   │ (HTTPS)
   ▼
Next.js App Router (Server Components & Route Handlers)
   │
   ├── Better Auth & Server RBAC (`lib/auth/server.ts`)
   │
   ├── Zod Schemas (`lib/validation/schemas.ts`)
   │
   ├── Application Service Layer (`services/*`)
   │
   └── Drizzle ORM (`db/client.ts`)
           │
           ▼
   Neon Serverless PostgreSQL
```

---

## Data Access & Security Rules

1. **Zero Browser DB Access:** The browser client never connects directly to the PostgreSQL database.
2. **Server-Only Database Credentials:** `DATABASE_URL` is kept strictly server-side.
3. **Type-Safe Drizzle ORM:** Queries and migrations are defined using Drizzle ORM schema definitions in `db/schema/*`.
4. **Better Auth Session Management:** User identities and sessions are managed by Better Auth with Drizzle adapter.
5. **Server RBAC Guards:** Administrative actions are protected server-side by `requireStaff()`, `requireTeamLead()`, and `requireAdmin()`.
6. **Atomic Capacity Transactions:** Slot capacity locking is handled via server-side PostgreSQL transactions (`db.transaction`) with `FOR UPDATE` row locking.
