// Apply Drizzle migration SQL files in order via the app's own Drizzle/Neon
// connection. Fallback for environments where `drizzle-kit push` / `migrate`
// cannot reach the database (e.g. SSL incompatibilities with the Neon pooler).
// Loads .env.local when present (CI injects env vars directly), then dynamically
// imports @/db so DATABASE_URL is set.
import { readFileSync, readdirSync } from 'fs';
import * as path from 'path';
import { loadEnvLocal } from './lib/env';

loadEnvLocal();

async function main() {
  const { db } = await import('@/db');
  const { sql } = await import('drizzle-orm');
  if (!db) {
    console.error('❌ DATABASE_URL not set — cannot apply migrations.');
    process.exit(1);
  }

  const migrationsDir = path.resolve(process.cwd(), 'db/migrations');
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const content = readFileSync(path.join(migrationsDir, file), 'utf8');
    const stmts = content.split('--> statement-breakpoint;').map((s) => s.trim()).filter(Boolean);
    console.log(`\n=== ${file} (${stmts.length} statements) ===`);
    for (const stmt of stmts) {
      await db.execute(sql.raw(stmt));
      console.log('applied:', stmt.slice(0, 60).replace(/\n/g, ' '));
    }
  }

  console.log('\n✅ Migrations applied.');
  process.exit(0);
}

main().catch((e) => {
  console.error('ERR', e);
  process.exit(1);
});
