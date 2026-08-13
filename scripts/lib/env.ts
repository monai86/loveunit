// Load .env.local into process.env for local runs, WITHOUT overriding variables
// already present in the environment (CI injects DATABASE_URL, BETTER_AUTH_*,
// SMTP_* directly, and a missing .env.local must not crash).
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';

export function loadEnvLocal(): void {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (!existsSync(envLocalPath)) return;

  for (const line of readFileSync(envLocalPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    // Never override CI-provided values.
    if (!(match[1] in process.env)) {
      process.env[match[1]] = value.trim();
    }
  }
}
