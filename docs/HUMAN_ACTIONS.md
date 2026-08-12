# Human Actions Ledger — MUMT Blood Donation 2026 (Neon + Better Auth Edition)

| Action ID | Task Name | Why Human Required | Status | Blocks | Verification Method |
|---|---|---|---|---|---|
| **H-NEON-001** | Create Neon Project & Obtain `DATABASE_URL` | AI cannot log into Neon Dashboard or create cloud PostgreSQL databases. Credentials require human account access. | `WAITING_FOR_HUMAN` | Live Neon database connection & Drizzle migrations | Drizzle migration push & query test |
| **H-NEON-002** | Configure Better Auth Secrets | `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` require environment variable configuration in deployment environment. | `WAITING_FOR_HUMAN` | Staff login session security | Better Auth session creation test |
| **H-002** | Approve Privacy Notice Text | Institutional privacy policy requires university legal / administrative approval before production launch. | `OPEN` | Final public production launch | University legal signoff |
| **H-003** | Approve Donor Guidance & Official Infographic Artwork | Official public health guidance & infographic artwork must be provided by Thai Red Cross & Content PR team. | `OPEN` | Final public artwork replacement | PR team approval |
| **H-004** | Create Initial Staff & Admin Accounts | Production staff accounts must be created by an administrator via setup script or Better Auth sign-up. | `WAITING_FOR_HUMAN` | Staff login on live staging/production | Staff login test |
