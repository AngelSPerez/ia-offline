const CACHE_NAME = 'whyai-cache-v8';
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

// INSTALL - Con detección de errores
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('📦 Iniciando cacheo de assets...');
      
      for (const asset of STATIC_ASSETS) {
        try {
          const response = await fetch(asset);
          if (response.ok) {
            await cache.put(asset, response);
            console.log('✅ Cacheado:', asset);
          } else {
            console.warn('⚠️ Error HTTP', response.status, 'para:', asset);
          }
        } catch (err) {
          console.error('❌ FALLO:', asset, '-', err.message);
        }
      }
      
      console.log('🎉 Instalación completada');
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
  
  // ✅ Solo cachear peticiones GET
  if (req.method !== 'GET') {
    return; // Ignora HEAD, POST, etc. silenciosamente
  }
  
  const isIframeResource = url.hostname === IFRAME_DOMAIN;
  
  e.respondWith(
    Promise.race([
      fetch(req).then(res => {
        // Solo cachear respuestas válidas
        if (res && (res.ok || res.type === 'opaque')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, clone).catch(() => {
              // Ignora errores de caché silenciosamente
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
