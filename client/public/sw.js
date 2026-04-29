// Service Worker — Feminnita Marketing Push Notifications

self.addEventListener("push", (event) => {
  let data = { title: "Feminnita", body: "Nova notificação" };
  try { data = event.data?.json() ?? data; } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:  data.body,
      icon:  "/favicon.ico",
      badge: "/favicon.ico",
      tag:   data.tag ?? "feminnita",
      data:  { url: data.url ?? "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const target = event.notification.data?.url ?? "/";
      for (const c of list) {
        if (c.url.includes(self.location.origin) && "focus" in c) {
          c.navigate(target);
          return c.focus();
        }
      }
      return clients.openWindow(target);
    })
  );
});

self.addEventListener("install",  () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
