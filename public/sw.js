/* MUMT Blood Donation 2026 — offline-first service worker
 *
 * Strategy (pragmatic, works with hashed Next.js chunks):
 *  - navigations: network-first, fall back to cache (the app shell).
 *  - static assets (JS/CSS/fonts): stale-while-revalidate.
 *  - API GETs: stale-while-revalidate so staff can still search / see queue
 *    with the last-known data when the venue WiFi drops.
 *  - POST/PUT/DELETE pass through untouched — the app's offline action queue
 *    (lib/pwa/offline-queue) replays them when the network returns.
 */

const CACHE_VERSION = 'mumt-2026-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const APP_SHELL = ['/', '/staff/checkin', '/staff/queue', '/staff/walk-in', '/staff/login', '/mt70'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('mumt-2026-') && key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GET requests.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept RSC streaming payloads (?_rsc=...): they are live
  // server data, and caching them can serve stale/corrupt page chunks.
  if (url.searchParams.has('_rsc') || request.headers.get('RSC')) return;

  // Navigations: network-first with cached-shell fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || caches.match('/')
          )
        )
    );
    return;
  }

  // Assets + API GETs: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
