// ReturnIt Service Worker for Performance and Offline Support
const CACHE_VERSION = Date.now(); // Dynamic versioning for Android PWA updates
const CACHE_NAME = `returnit-v${CACHE_VERSION}`;
const STATIC_CACHE = `returnit-static-v${CACHE_VERSION}`;

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/logo-cardboard-deep.png',
  '/manifest.json',
  // Core CSS and JS will be added dynamically
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...', CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting() // Force immediate activation for Android updates
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE)
            .map(cacheName => {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip API requests
  if (url.pathname.startsWith('/api/')) return;

  // Skip external requests
  if (url.origin !== self.location.origin) return;

  // Cache strategy for different types of requests
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    // Static assets - cache first with long expiry
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            // Serve from cache
            return response;
          }
          // Fetch and cache
          return fetch(request).then(fetchResponse => {
            if (fetchResponse.ok) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
    );
  } else {
    // HTML pages - network first, fallback to cache
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(request)
          .then(response => {
            // Cache successful responses
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Fallback to cache if network fails
            return cache.match(request) || cache.match('/');
          });
      })
    );
  }
});

// Message event for cache control
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
  
  // Force refresh for Android PWA updates
  if (event.data && event.data.type === 'FORCE_REFRESH') {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.navigate(client.url));
      });
    });
  }
  
  // Get cache version for update detection
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// Push notification event listener
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let options = {
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore', 
        title: 'View Order',
        icon: '/icon-192.png'
      },
      {
        action: 'close', 
        title: 'Close'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification('Return It - New Order', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the admin dashboard
    event.waitUntil(
      clients.openWindow('/admin-dashboard')
    );
  }
});

// Background sync for offline orders (if supported)
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    if (event.tag === 'offline-orders') {
      event.waitUntil(syncOfflineOrders());
    }
  });
}

async function syncOfflineOrders() {
  try {
    // Get pending orders from IndexedDB
    const db = await openDB();
    const transaction = db.transaction(['pendingOrders'], 'readonly');
    const store = transaction.objectStore('pendingOrders');
    const pendingOrders = await store.getAll();
    
    // Sync each pending order
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order.data),
          credentials: 'include'
        });
        
        if (response.ok) {
          // Remove from pending orders
          const deleteTransaction = db.transaction(['pendingOrders'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('pendingOrders');
          await deleteStore.delete(order.id);
        }
      } catch (error) {
        console.log('Failed to sync order:', order.id, error);
      }
    }
  } catch (error) {
    console.log('Background sync error:', error);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ReturnItDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingOrders')) {
        db.createObjectStore('pendingOrders', { keyPath: 'id' });
      }
    };
  });
}