// Asistente TALOS Service Worker
// Minimal SW — enables PWA installability. No offline caching (app requires real-time Firestore data).

const CACHE_NAME = 'talos-coach-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Borrar todos los caches viejos al activar nueva versión del SW
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Pass-through: always fetch from network (data must be fresh)
  event.respondWith(fetch(event.request));
});
