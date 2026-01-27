const CACHE_NAME = 'whyai-cache-v2';

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
  asset('/build.sh'),
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

console.log('🔧 BASE_PATH detectado:', BASE_PATH);

// INSTALL
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('📦 Cacheando assets estáticos...');
      for (const asset of STATIC_ASSETS) {
        try {
          const res = await fetch(asset);
          if (res.ok) {
            await cache.put(asset, res);
            console.log('✅ Cacheado:', asset);
          }
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
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// FETCH — NETWORK FIRST GLOBAL
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  // Solo GET
  if (req.method !== 'GET') return;

  e.respondWith(
    (async () => {
      try {
        // 🌐 INTENTO DE RED SIEMPRE
        const response = await fetch(req);

        // 🧠 Inyectar COOP/COEP SOLO en documentos del mismo origen
        if (url.origin === self.location.origin && req.destination === 'document') {
          const headers = new Headers(response.headers);
          headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
          headers.set('Cross-Origin-Opener-Policy', 'same-origin');

          const modified = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });

          const clone = modified.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, clone).catch(() => {});
          });

          console.log('🌐 Documento desde RED:', req.url);
          return modified;
        }

        // 📦 Cachear cualquier recurso válido (incluye iframe)
        if (response.ok || response.type === 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, clone).catch(() => {});
          });

          if (url.hostname === IFRAME_DOMAIN) {
            console.log('🌐 Iframe desde RED:', req.url);
          }
        }

        return response;

      } catch (err) {
        // ❌ RED FALLÓ → USAR CACHE REAL
        const cached = await caches.match(req);
        if (cached) {
          console.warn('⚠️ Cache fallback:', req.url);
          return cached;
        }

        // Último recurso para navegación
        if (req.mode === 'navigate') {
          return caches.match(asset('/index.html'));
        }

        throw err;
      }
    })()
  );
});
