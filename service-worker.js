/* ==========================================================================
   MISSION 89 — Service Worker
   Cache-first app shell so the app works fully offline after first load.
   ========================================================================== */
const CACHE_NAME = 'mission89-cache-v3';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/storage.js',
  './js/utils.js',
  './js/workoutData.js',
  './js/dashboard.js',
  './js/checkin.js',
  './js/workout.js',
  './js/nutrition.js',
  './js/progress.js',
  './js/calendar.js',
  './js/photos.js',
  './js/coach.js',
  './js/settings.js',
  './js/app.js',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if(req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      const networkFetch = fetch(req).then(res => {
        if(res && res.status === 200 && res.type === 'basic'){
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached || caches.match('./index.html'));

      // cache-first: return cached immediately if present, else wait for network
      return cached || networkFetch;
    })
  );
});
