const CACHE_NAME = 'whyai-cache-v4';
const TIMEOUT = 5000;
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

const IFRAME_DOMAIN = 'whyia-chat221.vercel.app';

// INSTALL
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(STATIC_ASSETS))
      .catch(err => {
        console.warn('Error al cachear assets iniciales:', err);
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

// FETCH
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  
  // ✅ SOLO cachear peticiones GET (ignorar HEAD, POST, etc.)
  if (req.method !== 'GET') {
    console.log('⏭️ Ignorando petición', req.method, ':', req.url);
    return; // Dejar que pase sin cachear
  }
  
  const isIframeResource = url.hostname === IFRAME_DOMAIN;
  
  e.respondWith(
    Promise.race([
      fetch(req).then(res => {
        // ✅ Solo intentar cachear si es GET y respuesta válida
        if (res && (res.ok || res.type === 'opaque')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, clone).catch(err => {
              // Ignorar errores silenciosamente
              // (Ya no deberían aparecer errores de HEAD)
            });
          });
          
          if (isIframeResource) {
            console.log('📦 Cacheando recurso del iframe:', req.url);
          }
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
          console.log('✅ Sirviendo desde caché:', req.url);
          return cached;
        }
        
        if (req.mode === 'navigate' && !isIframeResource) {
          return caches.match('/index.html');
        }
        
        return undefined;
      });
    })
  );
});
