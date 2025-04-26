const CACHE_NAME = 'vibetunes-cache-v1';
const AUDIO_CACHE = 'vibetunes-audio-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/player.js',
                '/queue.js',
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
        } else if (normalizedUrl.includes('github.com') && normalizedUrl.includes('raw')) {
            normalizedUrl = normalizedUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        }

        event.respondWith(
            caches.open(AUDIO_CACHE).then(async cache => {
                const cachedResponse = await cache.match(normalizedUrl);
                if (cachedResponse) {
                    const cachedDate = new Date(cachedResponse.headers.get('date')).getTime();
                    if (Date.now() - cachedDate < CACHE_DURATION) {
                        console.log(`Cache hit for ${normalizedUrl}`);
                        return cachedResponse;
                    }
                    console.log(`Cache expired for ${normalizedUrl}`);
                } else {
                    console.log(`Cache miss for ${normalizedUrl}`);
                }

                return fetchWithTimeout(normalizedUrl, 5000).then(async networkResponse => {
                    if (networkResponse.ok) {
                        const contentLength = networkResponse.headers.get('content-length');
                        if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
                            console.warn(`Skipping cache for large file: ${requestUrl.pathname} (${contentLength} bytes)`);
                        } else {
                            const clone = networkResponse.clone();
                            cache.put(normalizedUrl, clone);
                            console.log(`Cached ${normalizedUrl}`);
                            await trimCache(AUDIO_CACHE, MAX_CACHE_SIZE);
                        }
                    } else {
                        console.warn(`Network response not OK for ${normalizedUrl}: ${networkResponse.status}`);
                    }
                    return networkResponse;
                }).catch(async err => {
                    console.error(`Fetch failed for ${requestUrl.pathname}:`, err);
                    if (cachedResponse) {
                        console.log(`Falling back to cached response for ${normalizedUrl}`);
                        return cachedResponse;
                    }
                    return new Response(null, { status: 404 });
                });
            })
        );
        return;
    }

    // Cache-first for other assets
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                console.log(`Cache hit for ${event.request.url}`);
                return response;
            }
            console.log(`Cache miss for ${event.request.url}, fetching from network`);
            return fetch(event.request).then(networkResponse => {
                if (networkResponse.ok) {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                }
                return networkResponse;
            }).catch(err => {
                console.warn(`Network error for ${event.request.url}:`, err);
                return new Response(null, { status: 503 });
            });
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
    const requestData = [];

    // Calculate total size and collect request metadata
    for (const request of requests) {
        const response = await cache.match(request);
        const size = parseInt(response?.headers.get('content-length') || 0);
        const date = new Date(response?.headers.get('date') || Date.now()).getTime();
        totalSize += size;
        requestData.push({ request, size, date });
    }

    // Sort by date (oldest first) to prioritize keeping recent files
    requestData.sort((a, b) => a.date - b.date);

    // Trim if over size limit
    if (totalSize > maxSize) {
        for (const { request, size } of requestData) {
            await cache.delete(request);
            totalSize -= size;
            console.log(`Trimmed ${request.url} from cache`);
            if (totalSize <= maxSize) break;
        }
    }

    self.addEventListener('install', () => console.log('Service Worker installed'));
    self.addEventListener('activate', () => console.log('Service Worker activated'));
    self.addEventListener('fetch', event => event.respondWith(fetch(event.request)));
}