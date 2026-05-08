const CACHE_NAME = 'biblia-pwa-cache-v1';
const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/api.js',
    '/js/ui.js',
    // Adicione aqui outros assets estáticos, como imagens de ícones, fontes, etc.
];

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
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache-First para o App Shell
                if (response && APP_SHELL_URLS.includes(event.request.url.replace(self.location.origin, ''))) {
                    return response;
                }

                // Stale-While-Revalidate para o restante
                return fetch(event.request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const clonedResponse = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, clonedResponse);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => caches.match(event.request)); // Fallback to cache if network fails
            })
    );
});
