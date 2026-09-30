// Bump this when the app shell changes so Cache-First clients pick up deploys.
const CACHE_NAME = 'biblia-pwa-cache-v2';
const APP_SHELL_URLS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/api.js',
    './js/ui.js',
    './manifest.json',
];
const DATA_PREFIX = new URL('./data/', self.location.href).pathname;

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: App Shell cacheado.');
                return cache.addAll(APP_SHELL_URLS);
            })
            .catch((error) => {
                console.error('Service Worker: Falha ao cachear App Shell:', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Limpando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return;
    }

    if (url.origin === self.location.origin && url.pathname.startsWith(DATA_PREFIX)) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    event.respondWith(cacheFirst(request));
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    const networkPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => cachedResponse);

    return cachedResponse || networkPromise;
}

async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return cachedResponse;
    }
}
