// Apply Drizzle migration SQL files in order via the app's own Drizzle/Neon
// connection. Fallback for environments where `drizzle-kit push` / `migrate`
// cannot reach the database (e.g. SSL incompatibilities with the Neon pooler).
// Loads .env.local when present (CI injects env vars directly), then dynamically
// imports @/db so DATABASE_URL is set.
import { loadEnvLocal } from './lib/env';
import { applyMigrations } from './lib/apply-migrations';

loadEnvLocal();

async function main() {
  const { db } = await import('@/db');
  if (!db) {
    console.error('❌ DATABASE_URL not set — cannot apply migrations.');
    process.exit(1);
  }

  const count = await applyMigrations(db);
  console.log(`\n✅ ${count} migration statements applied.`);
  process.exit(0);
}

main().catch((e) => {
  console.error('ERR', e);
  process.exit(1);
});
