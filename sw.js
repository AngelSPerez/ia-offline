const CACHE_NAME = 'whyai-cache-v3';

const SW_PATH = self.location.pathname;
const BASE_PATH = SW_PATH.substring(0, SW_PATH.lastIndexOf('/'));

function asset(path) {
  if (path.startsWith(BASE_PATH)) return path;
  if (path === '/') return BASE_PATH + '/index.html';
  return BASE_PATH + path;
}

const STATIC_ASSETS = [
  asset('/index.html'),
  asset('/manifest.json'),
  asset('/custom-whyai.css'),
  asset('/high.css'),
  asset('/install.html'),
  asset('/redirect.html'),
  asset('/offline.html'),
  asset('/assets/index-BZ_wFqig.js'),
  asset('/assets/index-q-smNyI7.css'),
  asset('/assets/wllama-DTxmcCWH.wasm'),
  asset('/assets/wllama-JeypyGAC.wasm'),
  asset('/icons/192.png'),
  asset('/icons/512.png'),
  asset('/icons/logo192.png'),
  asset('/icons/logo512.png'),
  asset('/whyai.png'),
  asset('/icons/whyai-off.png'),
  asset('/power.png')
];

const IFRAME_DOMAIN = 'whyia-chat221.vercel.app';

// INSTALL
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const a of STATIC_ASSETS) {
        try {
          const res = await fetch(a);
          if (res.ok) await cache.put(a, res);
        } catch {}
      }
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH — NETWORK FIRST REAL
self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.method !== 'GET') return;

  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(req);

        // ✅ SOLO navegación del mismo origen → headers
        if (
          req.mode === 'navigate' &&
          new URL(req.url).origin === self.location.origin
        ) {
          const headers = new Headers(networkResponse.headers);
          headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
          headers.set('Cross-Origin-Opener-Policy', 'same-origin');

          return new Response(networkResponse.body, {
            status: networkResponse.status,
            statusText: networkResponse.statusText,
            headers
          });
        }

        // 📦 Cachear solo recursos seguros (NO documents)
        if (
          networkResponse.ok &&
          req.destination !== 'document'
        ) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, networkResponse.clone()).catch(() => {});
        }

        return networkResponse;

      } catch (err) {
        // 🔻 SOLO si la red realmente falló
        const cached = await caches.match(req);
        if (cached) return cached;

        if (req.mode === 'navigate') {
          return caches.match(asset('/offline.html'));
        }

        throw err;
      }
    })()
  );
});
