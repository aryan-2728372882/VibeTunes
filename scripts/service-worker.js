// service-worker.js

self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    // Perform installation steps, e.g., caching assets
});

self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
    // Perform activation steps, e.g., cleaning up old caches
});

self.addEventListener('fetch', event => {
    // Intercept network requests and handle them as needed
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
