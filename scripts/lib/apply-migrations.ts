// Apply Drizzle migration SQL files in order via any drizzle db instance.
// Shared by:
//   - scripts/apply-migration.ts   (CLI for deploy / CI)
//   - tests/db.integration.test.ts (runs migrations into a disposable scratch DB)
//
// The SQL files use drizzle-kit's `--> statement-breakpoint;` separators.
import { readFileSync, readdirSync } from 'fs';
import * as path from 'path';
import { sql, type SQL } from 'drizzle-orm';

export interface MigrationExecutable {
  execute: (query: SQL) => Promise<unknown>;
}

export interface ApplyMigrationsOptions {
  /** Log every statement (defaults to true, matching the old CLI output). */
  verbose?: boolean;
}

export async function applyMigrations(db: MigrationExecutable, options: ApplyMigrationsOptions = {}): Promise<number> {
  const verbose = options.verbose ?? true;
  const migrationsDir = path.resolve(process.cwd(), 'db/migrations');
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  let total = 0;
  for (const file of files) {
    const content = readFileSync(path.join(migrationsDir, file), 'utf8');
    const stmts = content.split('--> statement-breakpoint;').map((s) => s.trim()).filter(Boolean);
    if (verbose) console.log(`\n=== ${file} (${stmts.length} statements) ===`);
    for (const stmt of stmts) {
      await db.execute(sql.raw(stmt));
      total += 1;
      if (verbose) console.log('applied:', stmt.slice(0, 60).replace(/\n/g, ' '));
    }
  }
  return total;
}
