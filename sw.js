// Service Worker — thesouscote PWA
const CACHE_NAME = 'thesouscote-v5';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/projects.html',
  '/experience.html',
  '/about.html',
  '/contact.html',
  '/market.html',
  '/collecte.html',
  '/draft.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/assets/logo/Logo-thesouscote-noir.svg',
  '/assets/logo/Logo-thesouscote-blanc.svg',
  '/assets/icons/icon-192-light.svg',
  '/assets/icons/icon-512-light.svg',
  '/assets/icons/icon-192-dark.svg',
  '/assets/icons/icon-512-dark.svg'
];

// Install — cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
