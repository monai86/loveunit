// Set must_change_password=true for all seeded staff accounts.
// Usage: npx tsx scripts/flag-password-change.ts
// Reads .env.local for DATABASE_URL (same as apply-migration.ts).
import { readFileSync } from 'fs';
import * as path from 'path';

const envLocalPath = path.resolve(process.cwd(), '.env.local');
for (const line of readFileSync(envLocalPath, 'utf8').split('\n')) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    process.env[match[1]] = value.trim();
  }
}

async function main() {
  const { db } = await import('@/db');
  const { user } = await import('@/db/schema');
  const { staffProfiles } = await import('@/db/schema');
  const { inArray } = await import('drizzle-orm');

  if (!db) {
    console.error('❌ DATABASE_URL not set — cannot flag users.');
    process.exit(1);
  }

  const profiles = await db.select({ userId: staffProfiles.userId }).from(staffProfiles);
  const ids = profiles.map((p) => p.userId).filter(Boolean);
  if (ids.length === 0) {
    console.log('ℹ️  no staff profiles found — nothing to flag.');
    process.exit(0);
  }

  await db.update(user).set({ mustChangePassword: true }).where(inArray(user.id, ids));
  console.log(`✅ flagged ${ids.length} staff account(s) to require password change on next login.`);
  process.exit(0);
}

main().catch((e) => {
  console.error('ERR', e);
  process.exit(1);
});
