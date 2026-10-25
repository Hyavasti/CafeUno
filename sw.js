const CACHE_NAME = 'cafe-uno-offline-v3';
const assetsToCache = [
  './',
  './index.html',
  './admin.html'
];

// Install Service Worker and cache core local files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(assetsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate the service worker immediately
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Serve cached files when offline, ignoring browser extensions
self.addEventListener('fetch', event => {
  // Skip non-http requests (like chrome-extension:// or about:blank)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
          return caches.match('./admin.html');
        });
      })
  );
});