const CACHE_NAME = 'whyai-cache-v4';

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

// INSTALL
self.addEventListener('install', e => {
  e.waitUntil(
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
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  // 🚫 EXCLUIR IPAPI (CORS)
  if (url.hostname === 'ipapi.co') {
    return; // deja que el navegador lo maneje
  }

  event.respondWith(
    (async () => {
      try {
        const netRes = await fetch(req);

        // ✅ COOP / COEP solo navegación mismo origen
        if (
          req.mode === 'navigate' &&
          url.origin === self.location.origin
        ) {
          const headers = new Headers(netRes.headers);
          headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
          headers.set('Cross-Origin-Opener-Policy', 'same-origin');

          return new Response(netRes.body, {
            status: netRes.status,
            statusText: netRes.statusText,
            headers
          });
        }

        // 📦 Cache solo mismo origen y no documentos
        if (
          url.origin === self.location.origin &&
          netRes.ok &&
          req.destination !== 'document'
        ) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, netRes.clone()).catch(() => {});
        }

        return netRes;

      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;

        if (req.mode === 'navigate') {
          return caches.match(asset('/offline.html'));
        }

        throw new Error('Network error');
      }
    })()
  );
});

