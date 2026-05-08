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
    const { request } = event;
    const url = new URL(request.url);

    // Estratégia Stale-While-Revalidate para os dados da Bíblia (JSONs)
    if (url.pathname.startsWith('/data/')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(request).then((cachedResponse) => {
                    const fetchPromise = fetch(request).then((networkResponse) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });

                    // Retorna o cache se disponível, senão espera a rede
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return; // Encerra aqui para esta estratégia
    }

    // Estratégia Cache-First para todos os outros assets (App Shell, fontes, etc.)
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            return cachedResponse || fetch(request).then((networkResponse) => {
                // Opcional: Cachear assets não encontrados no App Shell inicial
                if (networkResponse && networkResponse.status === 200) {
                    const clonedResponse = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, clonedResponse);
                    });
                }
                return networkResponse;
            });
        })
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
