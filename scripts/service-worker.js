const CACHE_NAME = 'vibetunes-cache-v2';
const AUDIO_CACHE = 'vibetunes-audio-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 150 * 1024 * 1024; // Increased to 150MB
const MAX_FILE_SIZE = 15 * 1024 * 1024; // Increased to 15MB

self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/player.js',
                '/auth.html',
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
        }).then(() => {
            // Clean up expired audio files
            return caches.open(AUDIO_CACHE).then(cache => {
                return cache.keys().then(requests => {
                    const now = Date.now();
                    return Promise.all(
                        requests.map(async request => {
                            const response = await cache.match(request);
                            const cacheDate = new Date(response?.headers.get('date') || now).getTime();
                            if (now - cacheDate > CACHE_DURATION) {
                                console.log(`Deleting expired audio file: ${request.url}`);
                                return cache.delete(request);
                            }
                        })
                    );
                });
            });
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Handle audio files with improved caching
    if (requestUrl.pathname.endsWith('.mp3') || 
        requestUrl.pathname.endsWith('.wav') || 
        requestUrl.pathname.endsWith('.ogg') || 
        requestUrl.pathname.endsWith('.m4a') || 
        requestUrl.pathname.includes('audio')) {
        
        let normalizedUrl = requestUrl.href;
        
        // Normalize URLs for different hosting services
        if (normalizedUrl.includes('dropbox.com')) {
            // Handle various Dropbox URL formats
            if (normalizedUrl.includes('raw=1')) {
                normalizedUrl = normalizedUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?raw=1', '');
            } else if (normalizedUrl.includes('dl=0')) {
                normalizedUrl = normalizedUrl.replace('dl=0', 'dl=1');
            }
        } else if (normalizedUrl.includes('github.com') && normalizedUrl.includes('raw')) {
            normalizedUrl = normalizedUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        } else if (normalizedUrl.includes('supabase.co')) {
            // Ensure Supabase URLs are properly formatted for direct download
            if (!normalizedUrl.includes('download=true')) {
                normalizedUrl = normalizedUrl + (normalizedUrl.includes('?') ? '&' : '?') + 'download=true';
            }
        }

        // Log the audio request for debugging
        console.log(`Audio request intercepted: ${normalizedUrl}`);

        event.respondWith(
            caches.open(AUDIO_CACHE).then(async cache => {
                // Try to get from cache first with improved handling
                try {
                    const cachedResponse = await cache.match(normalizedUrl);
                    if (cachedResponse) {
                        const cachedDate = new Date(cachedResponse.headers.get('date') || Date.now()).getTime();
                        const cacheAge = Date.now() - cachedDate;
                        
                        // Check if cache is still valid
                        if (cacheAge < CACHE_DURATION) {
                            console.log(`Cache hit for ${normalizedUrl} (age: ${Math.round(cacheAge/1000)}s)`);
                            
                            // Check if we have the full file
                            const contentLength = cachedResponse.headers.get('content-length');
                            if (contentLength && parseInt(contentLength) > 0) {
                                return cachedResponse;
                            } else {
                                console.warn(`Cached response for ${normalizedUrl} has no content length, may be incomplete`);
                                // Continue to fetch to replace potentially incomplete cache
                            }
                        } else {
                            console.log(`Cache expired for ${normalizedUrl} (age: ${Math.round(cacheAge/1000)}s)`);
                            // Don't delete yet - we'll use it as fallback if fetch fails
                        }
                    } else {
                        console.log(`Cache miss for ${normalizedUrl}`);
                    }
                } catch (cacheError) {
                    console.error(`Error checking cache for ${normalizedUrl}:`, cacheError);
                }

                // Enhanced retry fetch with adaptive timeouts and exponential backoff
                const fetchWithRetry = async (url, timeout, retries = 4) => {
                    // Start with a smaller timeout for the first attempt to fail fast if unreachable
                    let baseTimeout = timeout;
                    
                    // Check if the URL is likely to be a large file based on extension or path
                    const isLikelyLargeFile = url.includes('mp3') || url.includes('audio') || 
                                             url.includes('.wav') || url.includes('.ogg') || 
                                             url.includes('.m4a');
                    
                    // For likely large files, use longer timeouts
                    if (isLikelyLargeFile) {
                        baseTimeout = Math.max(timeout, 10000); // At least 10 seconds for audio files
                        console.log(`Using extended timeout for audio file: ${url}`);
                    }
                    
                    // Track consecutive timeout errors to adapt strategy
                    let consecutiveTimeoutErrors = 0;
                    
                    for (let i = 0; i < retries; i++) {
                        try {
                            // Exponential backoff for timeouts with a more aggressive curve for later attempts
                            const backoffFactor = i === 0 ? 1 : Math.pow(2, i);
                            const currentTimeout = baseTimeout * backoffFactor;
                            
                            console.log(`Fetch attempt ${i+1}/${retries} for ${url} (timeout: ${currentTimeout}ms)`);
                            
                            // For the first attempt, use a shorter timeout to fail fast if network is unreachable
                            // For subsequent attempts, use progressively longer timeouts
                            const attemptTimeout = (i === 0) ? Math.min(currentTimeout, 4000) : currentTimeout;
                            
                            // If we've had multiple timeout errors, try with a different approach
                            if (consecutiveTimeoutErrors >= 2) {
                                console.log(`Multiple timeout errors detected, trying alternative fetch approach for ${url}`);
                                // Add a random query parameter to bypass any potential caching issues
                                const bypassUrl = new URL(url);
                                bypassUrl.searchParams.set('_bypass', Date.now());
                                return await fetchWithTimeout(bypassUrl.toString(), attemptTimeout * 1.5);
                            }
                            
                            return await fetchWithTimeout(url, attemptTimeout);
                        } catch (err) {
                            const isTimeoutError = err.message && err.message.includes('timeout');
                            const isNetworkError = err.message && err.message.includes('Network error');
                            
                            console.warn(`Fetch attempt ${i+1} failed: ${err.message}`);
                            
                            // Track consecutive timeout errors
                            if (isTimeoutError) {
                                consecutiveTimeoutErrors++;
                            } else {
                                consecutiveTimeoutErrors = 0; // Reset if it's a different type of error
                            }
                            
                            // If it's the last retry, throw the error
                            if (i === retries - 1) throw err;
                            
                            // Adaptive retry delay based on error type and attempt number
                            let retryDelay;
                            if (isTimeoutError) {
                                // Longer delays for timeout errors (likely slow networks)
                                retryDelay = 2000 * (i + 1);
                            } else if (isNetworkError) {
                                // Medium delays for network errors
                                retryDelay = 1500 * (i + 1);
                            } else {
                                // Shorter delays for other errors (might be temporary server issues)
                                retryDelay = 1000 * (i + 1);
                            }
                            
                            console.log(`Waiting ${retryDelay}ms before retry attempt ${i+2}...`);
                            await new Promise(r => setTimeout(r, retryDelay));
                        }
                    }
                };

                try {
                    // Try to fetch with retries
                    const networkResponse = await fetchWithRetry(normalizedUrl, 5000);
                    
                    if (networkResponse.ok) {
                        const contentLength = networkResponse.headers.get('content-length');
                        const contentSize = contentLength ? parseInt(contentLength) : 0;
                        
                        // Cache the response if it's not too large
                        if (contentSize > 0 && contentSize <= MAX_FILE_SIZE) {
                            const clone = networkResponse.clone();
                            await cache.put(normalizedUrl, clone);
                            console.log(`Cached ${normalizedUrl} (${contentSize} bytes)`);
                            
                            // Trim cache in the background
                            setTimeout(() => trimCache(AUDIO_CACHE, MAX_CACHE_SIZE), 1000);
                        } else if (contentSize > MAX_FILE_SIZE) {
                            console.warn(`File too large to cache: ${requestUrl.pathname} (${contentSize} bytes)`);
                        } else {
                            console.warn(`Unknown content size for ${normalizedUrl}, caching anyway`);
                            const clone = networkResponse.clone();
                            await cache.put(normalizedUrl, clone);
                        }
                    } else {
                        console.warn(`Network response not OK for ${normalizedUrl}: ${networkResponse.status}`);
                    }
                    return networkResponse;
                } catch (err) {
                    console.error(`All fetch attempts failed for ${requestUrl.pathname}:`, err);
                    
                    // If we have a cached response (even expired), use it as fallback
                    if (cachedResponse) {
                        console.log(`Falling back to cached response for ${normalizedUrl}`);
                        return cachedResponse;
                    }
                    
                    // No cache available, return error response
                    return new Response(
                        JSON.stringify({ error: 'Failed to fetch audio file' }), 
                        { 
                            status: 503, 
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );
                }
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

// Enhanced fetch with timeout and progressive loading
async function fetchWithTimeout(url, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        // Add custom headers to potentially improve streaming performance
        const headers = new Headers({
            'Range': 'bytes=0-', // Request the entire file, enables partial responses
            'Cache-Control': 'no-transform, no-store', // Prevent proxies from modifying/caching
            'X-Requested-With': 'VibeTunes', // Custom header for tracking
            'Accept': '*/*', // Accept any content type
            'Connection': 'keep-alive' // Try to keep connection open for better performance
        });
        
        // Check if this is likely a large file
        const isLikelyLargeFile = url.includes('mp3') || url.includes('audio');
        
        // Use streaming fetch with priority hints
        const response = await fetch(url, { 
            signal: controller.signal,
            headers: headers,
            mode: 'cors',
            credentials: 'omit', // Don't send cookies for cross-origin requests
            priority: 'high', // Signal high priority to browser
            cache: 'no-store', // Don't use browser's HTTP cache, we manage our own
            // For large files, use a streaming approach
            ...(isLikelyLargeFile ? { redirect: 'follow' } : {})
        });
        
        clearTimeout(timeoutId);
        
        // Check for partial content response (206) which is good for streaming
        if (response.status === 206) {
            console.log(`Received partial content response for ${url}`);
        } else if (response.status === 200) {
            console.log(`Received full content response for ${url}`);
        } else {
            console.warn(`Received unusual status ${response.status} for ${url}`);
        }
        
        // Check content type and size for debugging
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        if (contentType) {
            console.log(`Content type: ${contentType} for ${url}`);
        }
        if (contentLength) {
            console.log(`Content length: ${contentLength} bytes for ${url}`);
        }
        
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        
        // Provide more detailed error information
        if (error.name === 'AbortError') {
            console.error(`Fetch timeout after ${timeout}ms for ${url}`);
            throw new Error(`Fetch timeout after ${timeout}ms`);
        } else if (error.name === 'TypeError') {
            console.error(`Network error for ${url}: ${error.message}`);
            throw new Error(`Network error: ${error.message}`);
        } else {
            console.error(`Fetch error for ${url}: ${error.name} - ${error.message}`);
            throw error;
        }
    }
}

// Trim cache
async function trimCache(cacheName, maxSize) {
    try {
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
    } catch (error) {
        console.error(`Error trimming cache ${cacheName}:`, error);
    }
}