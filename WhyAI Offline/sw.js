// sw.js
const CACHE_NAME = 'whyai-net-first-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './custom-whyai.css',
  './wllama.png',
  // './manifest.json' // Descomenta si creaste el manifest
];

// 1. INSTALACIÓN: Guardamos lo básico por si acaso
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[WhyAI] Precargando App Shell...');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. ACTIVACIÓN: Limpieza de cachés viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. FETCH: ESTRATEGIA NETWORK FIRST (Red Primero)
self.addEventListener('fetch', (event) => {
  // Solo interceptamos peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // A. Intentamos ir a INTERNET primero
    fetch(event.request)
      .then((networkResponse) => {
        // Si la red responde bien, guardamos una copia fresca en caché y la entregamos
        // Verificamos que sea una respuesta válida (status 200)
        if (networkResponse && networkResponse.status === 200) {
           const responseToCache = networkResponse.clone();
           caches.open(CACHE_NAME).then((cache) => {
             cache.put(event.request, responseToCache);
           });
        }
        return networkResponse;
      })
      .catch(() => {
        // B. Si la red falla (OFFLINE), usamos la caché
        console.log('[WhyAI] Sin conexión. Usando caché para:', event.request.url);
        return caches.match(event.request);
      })
  );
});