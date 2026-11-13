// Carelink Healthineers Mobile Service Worker
// Enables notifications directly in Phone Notification Bar (Android / iOS)

const CACHE_NAME = 'carelink-sw-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle messages from the app to display a phone system notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_PHONE_NOTIFICATION') {
    const { title, options } = event.data;
    const notificationOptions = {
      body: options?.body || '',
      icon: options?.icon || '/pwa-192x192.png',
      badge: options?.badge || '/pwa-192x192.png',
      vibrate: options?.vibrate || [200, 100, 200],
      tag: options?.tag || `carelink_${Date.now()}`,
      renotify: options?.renotify !== false,
      data: options?.data || { url: '/' },
      requireInteraction: options?.requireInteraction || false,
    };

    self.registration.showNotification(title, notificationOptions);
  }
});

// Handle click on notification in phone's notification bar
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = data.url || '/';

  // Relative path resolution
  if (!targetUrl.startsWith('http')) {
    targetUrl = new URL(targetUrl, self.location.origin).href;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Listen for Web Push if configured
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Carelink Healthineers Notification',
    body: 'You have a new update in your portal.',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    data: payload.data || { url: '/' },
    tag: payload.tag || `carelink_push_${Date.now()}`,
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});
