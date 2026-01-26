const CACHE_NAME = 'whyai-cache-v1.1';
const TIMEOUT = 10000; // ✅ Aumentado a 10 segundos para archivos grandes
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
  '/icons/192.png',
  '/icons/512.png',
  '/icons/logo192.png',
  '/icons/logo512.png',
  '/whyai.png',
  '/icons/whyai-off.png',
  '/power.png'
];

// ✅ Archivos WASM que DEBEN cachearse
const WASM_ASSETS = [
  '/assets/wllama-DTxmcCWH.wasm',
  '/assets/wllama-JepyyGAC.wasm'
];

// ✅ Dominio del iframe - cachear TODOS sus recursos
const IFRAME_DOMAIN = 'whyia-chat221.vercel.app';

// INSTALL - Cacheo agresivo con reintentos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // 1. Cachear assets normales
      console.log('📦 Cacheando assets estáticos...');
      try {
        await cache.addAll(STATIC_ASSETS);
        console.log('✅ Assets estáticos cacheados');
      } catch (err) {
        console.warn('⚠️ Error en assets estáticos:', err);
      }
      
      // 2. Cachear WASM uno por uno con reintentos
      for (const wasmUrl of WASM_ASSETS) {
        let cached = false;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!cached && attempts < maxAttempts) {
          attempts++;
          try {
            console.log(`📥 Intentando cachear WASM (intento ${attempts}/${maxAttempts}):`, wasmUrl);
            
            const response = await fetch(wasmUrl, {
              method: 'GET',
              mode: 'no-cors', // ✅ Permite respuestas opaque
              cache: 'no-cache'
            });
            
            if (response) {
              await cache.put(wasmUrl, response);
              console.log('✅ WASM cacheado exitosamente:', wasmUrl);
              cached = true;
            }
          } catch (err) {
            console.warn(`⚠️ Intento ${attempts} fallido para ${wasmUrl}:`, err.message);
            if (attempts < maxAttempts) {
              // Esperar antes de reintentar
              await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
          }
        }
        
        if (!cached) {
          console.error('❌ No se pudo cachear WASM después de', maxAttempts, 'intentos:', wasmUrl);
        }
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

// FETCH - Estrategia Cache First para WASM, Network First para lo demás
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  
  // ✅ Detectar si es recurso del iframe
  const isIframeResource = url.hostname === IFRAME_DOMAIN;
  
  // ✅ Detectar si es archivo WASM
  const isWasm = url.pathname.endsWith('.wasm');
  
  // ✅ ESTRATEGIA CACHE-FIRST para WASM (prioridad a caché)
  if (isWasm) {
    e.respondWith(
      caches.match(req).then(cached => {
        if (cached) {
          console.log('✅ WASM servido desde caché:', req.url);
          return cached;
        }
        
        // Si no está en caché, intentar descargarlo
        console.log('📥 WASM no en caché, descargando:', req.url);
        return fetch(req, { mode: 'no-cors' }).then(res => {
          // Cachear para futuras peticiones
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, clone).catch(err => {
              console.warn('⚠️ Error al cachear WASM:', err);
            });
          });
          return res;
        }).catch(err => {
          console.error('❌ Error descargando WASM:', req.url, err);
          // Retornar error 503
          return new Response('WASM not available', { 
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
    );
    return;
  }
  
  // ✅ ESTRATEGIA NETWORK-FIRST para todo lo demás
  e.respondWith(
    Promise.race([
      fetch(req).then(res => {
        // Cachear respuesta si es válida
        if (res.ok || res.type === 'opaque') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, clone).catch(() => {
              console.log('No se pudo cachear:', req.url);
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
        
        // Para navegación local sin caché, ir a index
        if (req.mode === 'navigate' && !isIframeResource) {
          return caches.match('/index.html');
        }
        
        return undefined;
      });
    })
  );
});
