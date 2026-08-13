'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Defer registration until the page is idle so it never blocks first paint.
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Registration failing (e.g. unsupported context) is non-fatal — the
        // app still works fully online; only offline buffering is lost.
      });
    };

    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(register);
    } else {
      globalThis.setTimeout(register, 1000);
    }
  }, []);

  return null;
}
