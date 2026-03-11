// TALOS Coach Service Worker
// Minimal SW — enables PWA installability. No offline caching (app requires real-time Firestore data).

const CACHE_NAME = 'talos-coach-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through: always fetch from network (data must be fresh)
  event.respondWith(fetch(event.request));
});
