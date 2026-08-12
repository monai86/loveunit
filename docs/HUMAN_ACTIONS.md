# Human Actions Ledger — MUMT Blood Donation 2026

| Action ID | Task Name | Why Human Required | Status | Blocks | Verification Method |
|---|---|---|---|---|---|
| **H-001** | Configure Real Supabase Project Credentials | AI cannot sign into Supabase Dashboard or create projects. Secret keys (`SUPABASE_SERVICE_ROLE_KEY`) require human account access. | `WAITING_FOR_HUMAN` | Real production deployment & live database operations | Verify Supabase Auth login & API data persistence |
| **H-002** | Approve Privacy Notice Text | Institutional privacy policy requires university legal / administrative approval before production launch. | `OPEN` | Final public production launch | University legal signoff |
| **H-003** | Approve Donor Guidance & Official Infographic Artwork | Official public health guidance & infographic artwork must be provided by Thai Red Cross & Content PR team. | `OPEN` | Final public artwork replacement | PR team approval |
| **H-004** | Create Staff & Admin Initial Accounts | Production staff accounts must be created by an authorized administrator in Supabase Auth Dashboard or seed script. | `WAITING_FOR_HUMAN` | Staff login on live staging/production | Staff login test |
| **H-005** | Authenticate GitHub & Push Remote Repository | Creating remote GitHub repo and pushing code requires GitHub account authentication / OAuth login. | `DONE` | Remote repository hosting on GitHub | `git push -u origin main` verification |
