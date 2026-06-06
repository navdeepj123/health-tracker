// Service Worker — runs in the background, separate from the main page.
// Handles two things:
//   1. PUSH events: shows a notification when the backend sends one
//   2. FETCH caching: serves pages from cache when offline

const CACHE = 'ht-v1';

self.addEventListener('install', (e) => {
  // Cache the app shell on first install so it loads offline
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(['/', '/index.html']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Remove any old caches left over from a previous version
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Network first — fall back to cache if offline
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// THIS is the event that shows the actual notification on screen.
// The backend sends a web push, the browser wakes this service worker,
// and showNotification displays it — even if the app tab is closed.
self.addEventListener('push', (e) => {
  let data = { title: 'Health Tracker', body: 'You have an update!' };
  if (e.data) {
    try { data = e.data.json(); } catch { data.body = e.data.text(); }
  }

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png',
      badge: '/icon.png',
      vibrate: [200, 100, 200],
      // 'tag' replaces the previous notification instead of stacking them
      tag: 'health-tracker',
      renotify: true,
    })
  );
});

// When the user clicks the notification, focus the app or open it
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/dashboard');
    })
  );
});
