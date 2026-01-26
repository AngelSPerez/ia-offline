const CACHE_NAME = 'whyai-cache-v2';
const TIMEOUT = 5000;

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
  
  if (req.method !== 'GET') {
    return;
  }
  
  const isIframeResource = url.hostname === IFRAME_DOMAIN';
  
  e.respondWith(
    Promise.race([
      fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, clone).catch(() => {});
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
          return caches.match(asset('/index.html'));
        }
        
        return undefined;
      });
    })
  );
});
