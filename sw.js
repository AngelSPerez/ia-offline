const CACHE_NAME = 'whyai-cache-v1';
const TIMEOUT = 5000; // 5 segundos para dar tiempo a iframes

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/custom-whyai.css',
  '/high.css',
  '/install.html',
  '/redirect.html',
  '/offline.html',
  '/build.sh',
  '/assets/index-BZ_wFqjs.js',
  '/assets/index-q-smNyl7.css',
  '/assets/wllama-DTxmcCWH.wasm',
  '/assets/wllama-JepyyGAC.wasm',
  '/icons/192.png',
  '/icons/512.png',
  '/icons/logo192.png',
  '/icons/logo512.png',
  '/whyai.png',
  '/icons/whyai-off.png',
  '/power.png'
];

// ✅ Dominio del iframe - cachear TODOS sus recursos
const IFRAME_DOMAIN = 'whyia-chat221.vercel.app';

// INSTALL
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(STATIC_ASSETS))
      .catch(err => {
        console.warn('Error al cachear assets iniciales:', err);
        // Aún así continúa la instalación
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

// FETCH - Agresivo para iframes cross-domain
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  
  // ✅ Detectar si es recurso del iframe
  const isIframeResource = url.hostname === IFRAME_DOMAIN;

  e.respondWith(
    // Intenta red primero con timeout
    Promise.race([
      fetch(req).then(res => {
        // ✅ Cachea TODO del iframe (HTML, CSS, JS, imágenes, fuentes, etc.)
        // También cachea recursos locales normalmente
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, clone).catch(() => {
            // Silenciosamente ignora errores (ej: opaque muy grandes)
            console.log('No se pudo cachear:', req.url);
          });
        });
        
        // ✅ Log para verificar que se cachean recursos del iframe
        if (isIframeResource) {
          console.log('📦 Cacheando recurso del iframe:', req.url);
        }
        
        return res;
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), TIMEOUT)
      )
    ])
    .catch(() => {
      // OFFLINE o timeout → usa caché
      return caches.match(req).then(cached => {
        if (cached) {
          // ✅ Log cuando sirve desde caché
          console.log('✅ Sirviendo desde caché:', req.url);
          return cached;
        }
        
        // ❌ NO redirigir a offline.html para recursos del iframe
        // Si no hay caché para este recurso específico y es navegación local
        if (req.mode === 'navigate' && !isIframeResource) {
          return caches.match('/index.html');
        }
        
        // ⚠️ Para recursos sin caché, retornar undefined
        // (El navegador mostrará su propio error, pero el iframe seguirá funcionando)
        return undefined;
      });
    })
  );
});