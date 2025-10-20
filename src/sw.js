// sw.js - Service Worker for Push Notifications and Offline Support

const CACHE_NAME = 'tinedy-staff-portal-v1';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  // Note: We don't cache external resources like Google Fonts or Tailwind CDN in the app shell
];
const SYNC_TAG = 'sync-offline-actions';

// --- Lifecycle Events ---

self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching App Shell');
      return cache.addAll(APP_SHELL_URLS).catch(err => {
        console.error('[Service Worker] Failed to cache app shell:', err);
      });
    }).then(() => {
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => clients.claim())
  );
});


// --- Fetch Interception for Caching ---

self.addEventListener('fetch', event => {
  const { request } = event;

  // For Supabase API calls and other API requests, use a network-first strategy.
  if (request.url.includes('/rest/v1/') || request.url.startsWith('https://esm.sh/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // If the network fails, try to serve from cache.
        return caches.match(request);
      })
    );
    return;
  }

  // For App Shell resources, use a Cache-First strategy
  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request).then(networkResponse => {
        // Optionally, cache the new resource dynamically
        // caches.open(CACHE_NAME).then(cache => cache.put(request, networkResponse.clone()));
        return networkResponse;
      });
    })
  );
});


// --- Background Sync Event ---

self.addEventListener('sync', event => {
  if (event.tag === SYNC_TAG) {
    console.log('[Service Worker] Background sync started:', event.tag);
    // event.waitUntil(syncOfflineActions()); // Sync logic to be implemented later
  }
});

// --- Push Notification Events ---

self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received.');
  
  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('[Service Worker] Push event but no data');
    data = {
      title: 'New Notification',
      body: 'You have a new update from Tinedy CRM.',
    };
  }

  const { title, body, icon, data: notificationData } = data;

  const options = {
    body: body,
    icon: icon || '/vite.svg',
    badge: '/vite.svg',
    vibrate: [200, 100, 200],
    data: notificationData || { url: '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/';
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then(clientList => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});