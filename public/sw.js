// ReturnIt Service Worker for PWA functionality
const CACHE_NAME = 'returnit-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/book-pickup',
  '/driver-portal',
  '/favicon.svg',
  '/returnit-logo.png',
  '/site.webmanifest'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('ReturnIt: Service Worker installed and caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('ReturnIt: Service Worker install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('ReturnIt: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network first strategy for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Return a basic offline response for API calls
          return new Response(
            JSON.stringify({ 
              message: 'Offline - please check your connection',
              offline: true 
            }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Cache first strategy for static resources
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response for caching
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
      .catch(() => {
        // Fallback for offline navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      console.log('ReturnIt: Background sync triggered')
    );
  }
});

// Push notification support (for future driver/order updates)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New ReturnIt update',
    icon: '/returnit-logo.png',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/returnit-logo.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/returnit-logo.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ReturnIt', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});