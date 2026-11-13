self.addEventListener('push', function (event) {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    payload = {
      title: 'Carelink Healthineers',
      body: event.data.text(),
    };
  }

  const title = payload.title || 'Carelink Healthineers Alert';
  const body = payload.body || 'New activity update in your portal.';
  const targetUrl = payload.url || '/';
  const priority = payload.priority || 'normal';
  const tag = payload.tag || 'carelink-notification';

  const options = {
    body: body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: tag,
    renotify: true,
    requireInteraction: priority === 'urgent',
    data: {
      url: targetUrl,
      category: payload.category || 'system',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl && !client.url.endsWith(targetUrl)) {
            return client.navigate(targetUrl);
          }
          return client;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
