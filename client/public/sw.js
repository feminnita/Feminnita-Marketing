// Service Worker — Feminnita Chat PWA

const CACHE = "feminnita-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("/api/") || e.request.url.includes("/socket.io")) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

self.addEventListener("push", (event) => {
  let data = { title: "Feminnita Chat", body: "Nova mensagem" };
  try { data = event.data?.json() ?? data; } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:     data.body,
      icon:     "/logo.png",
      badge:    "/logo.png",
      tag:      data.tag ?? "feminnita-chat",
      renotify: true,
      vibrate:  [200, 100, 200],
      data:     { url: data.url ?? "/chat" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const target = event.notification.data?.url ?? "/chat";
      const existing = list.find((c) => c.url.includes("/chat"));
      if (existing) { existing.navigate(target); return existing.focus(); }
      return clients.openWindow(target);
    })
  );
});
