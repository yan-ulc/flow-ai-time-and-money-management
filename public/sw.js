// FlowAi Service Worker — handles Web Push notifications

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { title: "FlowAi", body: event.data?.text() ?? "" };
  }

  const title = data.title ?? "FlowAi";
  const options = {
    body: data.body ?? "",
    icon: "/icon-192.png",
    badge: "/icon-72.png",
    tag: data.tag ?? "flowai-notification",
    data: { url: data.url ?? "/app" },
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "/app";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If there's already an open window, focus it
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        return clients.openWindow(targetUrl);
      })
  );
});
