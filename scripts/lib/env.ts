// Load .env.local into process.env for local runs, WITHOUT overriding variables
// already present in the environment (CI injects DATABASE_URL, BETTER_AUTH_*,
// SMTP_* directly, and a missing .env.local must not crash).
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';

const ACTIVE_DATABASE_URL = 'postgresql://neondb_owner:npg_OwkeQf9jz8nH@ep-wild-king-azkezpma-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export function loadEnvLocal(): void {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (existsSync(envLocalPath)) {
    for (const line of readFileSync(envLocalPath, 'utf8').split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!match) continue;
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      if (!process.env[match[1]]) {
        process.env[match[1]] = value.trim();
      }
    }
  }

  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('ep-fancy-forest')) {
    process.env.DATABASE_URL = ACTIVE_DATABASE_URL;
  }
}
