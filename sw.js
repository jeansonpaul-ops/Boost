/* Boost PWA — service worker
   Stratégie : "stale-while-revalidate" — on sert depuis le cache tout de suite,
   puis on met à jour en arrière-plan. L'app fonctionne hors-ligne après la 1re visite. */
const CACHE = 'boost-v1';
const CORE = [
  './',
  'index.html',
  'support.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(function (cached) {
      var net = fetch(req).then(function (res) {
        try { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, cp); }); } catch (_) {}
        return res;
      }).catch(function () { return cached; });
      return cached || net;
    })
  );
});
