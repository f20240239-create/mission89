/* ASCEND — Service Worker v1 */
const CACHE_NAME = 'ascend-v1.1.1';
const APP_SHELL = [
  './','./index.html','./manifest.json','./css/style.css?v=1.1.1',
  './js/storage.js?v=1.1.1','./js/utils.js?v=1.1.1','./js/workoutData.js?v=1.1.1','./js/dashboard.js?v=1.1.1',
  './js/checkin.js?v=1.1.1','./js/workout.js?v=1.1.1','./js/nutrition.js?v=1.1.1','./js/progress.js?v=1.1.1',
  './js/calendar.js?v=1.1.1','./js/photos.js?v=1.1.1','./js/coach.js?v=1.1.1','./js/settings.js?v=1.1.1','./js/onboarding.js?v=1.1.1','./js/app.js?v=1.1.1',
  './icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/favicon.png','./icons/ascend-mark.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(req).then(res => {
      if(res && res.ok){
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
