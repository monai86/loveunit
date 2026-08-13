// Starts the Next.js standalone production server for Playwright E2E tests.
//
// Usage (local):   node scripts/start-e2e-server.mjs
// Usage (CI):      node scripts/start-e2e-server.mjs &  (env injected by CI)
//
// Builds the app into .next-e2e (NEXT_DIST_DIR) so a production build never
// clobbers a running dev server's .next, then runs the standalone server.js
// with static + public assets copied beside it. Loads .env.local only when
// present and only for keys not already set (CI provides real values).
import { spawn } from 'node:child_process';
import { cpSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = process.env.NEXT_DIST_DIR || '.next-e2e';
const standaloneDir = path.join(root, distDir, 'standalone');

// 1) Load .env.local for missing keys (local runs only).
const envLocalPath = path.join(root, '.env.local');
if (existsSync(envLocalPath)) {
  for (const line of readFileSync(envLocalPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
  }
}

// 2) Copy assets the standalone bundle needs (mirrors Dockerfile + distDir name).
const embeddedDist = path.join(standaloneDir, distDir);
const staticSrc = path.join(root, distDir, 'static');
const publicSrc = path.join(root, 'public');
if (existsSync(staticSrc)) cpSync(staticSrc, path.join(embeddedDist, 'static'), { recursive: true });
if (existsSync(publicSrc)) cpSync(publicSrc, path.join(standaloneDir, 'public'), { recursive: true });

// 3) Environment for the standalone server.
// BETTER_AUTH_URL / NEXT_PUBLIC_APP_URL are ALWAYS pinned to the running port:
// the origin must match where the browser actually hits, otherwise Better Auth
// rejects sign-in as a cross-origin request (a .env.local value for :3000 would
// break E2E on :3004).
const port = process.env.PORT || '3003';
const baseUrl = `http://localhost:${port}`;
const env = {
  ...process.env,
  NODE_ENV: 'production',
  BETTER_AUTH_URL: baseUrl,
  NEXT_PUBLIC_APP_URL: baseUrl,
  PORT: port,
  HOSTNAME: process.env.HOSTNAME || '127.0.0.1',
};

const server = spawn(process.execPath, ['server.js'], {
  cwd: standaloneDir,
  env,
  stdio: ['ignore', 'pipe', 'pipe'],
});
server.stdout.on('data', (d) => process.stdout.write(d));
server.stderr.on('data', (d) => process.stderr.write(d));
server.on('exit', (code) => process.exit(code ?? 0));
