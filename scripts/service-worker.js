const CACHE_NAME = 'vibetunes-cache-v1';
const AUDIO_CACHE = 'vibetunes-audio-cache';

self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/', // Cache homepage
                '/index.html',
                '/player.js',
                '/style.css'
            ]);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME && cache !== AUDIO_CACHE) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // ✅ Cache Audio Files for Background Playback
    if (requestUrl.pathname.endsWith('.mp3')) {
        event.respondWith(
            caches.open(AUDIO_CACHE).then(cache => {
                return cache.match(event.request).then(response => {
                    return response || fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // ✅ Handle Other Requests (Cache First, then Network)
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        }).catch(() => {
            console.warn("Network error, resource not available in cache:", event.request.url);
        })
    );
});

// ✅ Background Sync for Failed Requests
self.addEventListener('sync', event => {
    if (event.tag === 'retry-audio-download') {
        event.waitUntil(
            caches.open(AUDIO_CACHE).then(async cache => {
                const requests = await cache.keys();
                return Promise.all(
                    requests.map(request => {
                        return fetch(request).then(response => {
                            return cache.put(request, response);
                        });
                    })
                );
            })
        );
    }
});
