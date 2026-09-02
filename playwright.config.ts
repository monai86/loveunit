import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Locate the Playwright-managed Chromium binary. On this machine the
// headless-shell variant fails to download, so we point straight at the full
// "Google Chrome for Testing" executable. On CI (Linux) Playwright installs its
// own browsers into ~/.cache/ms-playwright and resolves them itself, so we
// return undefined there and let Playwright use its default resolution.
function findChromiumExecutable(): string | undefined {
  try {
    const cacheRoot =
      process.env.PLAYWRIGHT_BROWSERS_PATH ||
      (process.platform === 'darwin'
        ? path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright')
        : path.join(os.homedir(), '.cache', 'ms-playwright'));
    const candidates = fs
      .readdirSync(cacheRoot, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name.startsWith('chromium-'))
      .map((e) => path.join(cacheRoot, e.name));
    for (const dir of candidates) {
      for (const platform of ['chrome-mac-arm64', 'chrome-mac', 'chrome-linux', 'chrome-win']) {
        const binDir = path.join(dir, platform);
        if (!fs.existsSync(binDir)) continue;
        if (platform.includes('mac')) {
          const app = path.join(binDir, 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
          if (fs.existsSync(app)) return app;
        } else if (platform.includes('linux')) {
          const bin = path.join(binDir, 'chrome');
          if (fs.existsSync(bin)) return bin;
        } else {
          const bin = path.join(binDir, 'chrome.exe');
          if (fs.existsSync(bin)) return bin;
        }
      }
    }
  } catch {
    // Cache dir missing (e.g. Linux CI) — let Playwright resolve its own browser.
  }
  return undefined;
}

const chromiumExecutable = findChromiumExecutable();

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  timeout: 60_000,
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? 'github' : [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3003',
    trace: 'on-first-retry',
    ...(chromiumExecutable ? { launchOptions: { executablePath: chromiumExecutable } } : {}),
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npx next start -p 3003',
    port: 3003,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
