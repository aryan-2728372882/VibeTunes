const CACHE_NAME = 'vibetunes-cache-v1';
const AUDIO_CACHE = 'vibetunes-audio-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/player.js',
                '/style.css'
            ]);
        })
    );
    self.skipWaiting();
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
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Handle audio files
    if (requestUrl.pathname.endsWith('.mp3')) {
        let normalizedUrl = requestUrl.href;
        if (normalizedUrl.includes('dropbox.com') && normalizedUrl.includes('raw=1')) {
            normalizedUrl = normalizedUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?raw=1', '');
        }

        event.respondWith(
            caches.open(AUDIO_CACHE).then(async cache => {
                const cachedResponse = await cache.match(normalizedUrl);
                if (cachedResponse) {
                    const cachedDate = new Date(cachedResponse.headers.get('date')).getTime();
                    if (Date.now() - cachedDate < CACHE_DURATION) {
                        return cachedResponse;
                    }
                }

                return fetchWithTimeout(normalizedUrl, 1500).then(async networkResponse => {
                    if (networkResponse.ok) {
                        const contentLength = networkResponse.headers.get('content-length');
                        if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
                            console.warn(`Large file: ${requestUrl.pathname} (${contentLength} bytes)`);
                        } else {
                            const clone = networkResponse.clone();
                            cache.put(normalizedUrl, clone);
                            await trimCache(AUDIO_CACHE, MAX_CACHE_SIZE);
                        }
                    }
                    return networkResponse;
                }).catch(async err => {
                    console.error(`Fetch failed for ${requestUrl.pathname}:`, err);
                    return cachedResponse || new Response(null, { status: 404 });
                });
            })
        );
        return;
    }

    // Cache-first for other assets
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        }).catch(() => {
            console.warn("Network error:", event.request.url);
        })
    );
});

// Fetch with timeout
async function fetchWithTimeout(url, timeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

// Trim cache
async function trimCache(cacheName, maxSize) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    let totalSize = 0;

    for (const request of requests) {
        const response = await cache.match(request);
        const size = response?.headers.get('content-length') || 0;
        totalSize += parseInt(size);
    }

    if (totalSize > maxSize) {
        for (const request of requests) {
            await cache.delete(request);
            totalSize -= parseInt((await cache.match(request))?.headers.get('content-length') || 0);
            if (totalSize <= maxSize) break;
        }
    }
}