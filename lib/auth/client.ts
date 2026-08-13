'use client';

import { createAuthClient } from 'better-auth/react';

// Always talk to the same origin the page is served from. Hardcoding a port
// (e.g. NEXT_PUBLIC_APP_URL=http://localhost:3000) breaks auth on dev servers
// running on other ports (CORS + cookie mismatch).
export const authClient = createAuthClient({
  baseURL:
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});
