self.addEventListener("push", (event) => {
  let data = {
    title: "SOSme — Alerta",
    body: "Nuevo evento en tu perfil",
    url: "/dashboard/actividad",
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    /* use defaults */
  }

  const options = {
    body: data.body,
    icon: "/icon.png",
    badge: "/icon.png",
    data: { url: data.url ?? "/dashboard/actividad" },
    tag: "sos-alert",
    renotify: true,
    vibrate: [120, 60, 120],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

function isSafeUrl(url) {
  try {
    const parsed = new URL(url, self.location.origin);
    return parsed.origin === self.location.origin;
  } catch {
    return false;
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification.data?.url ?? "/dashboard/actividad";
  const url = isSafeUrl(raw) ? raw : "/dashboard/actividad";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          if (typeof client.navigate === "function") {
            return client.navigate(url).then(() => client.focus());
          }
          return client.focus();
        }
      }
      return clients.openWindow(url);
    }),
  );
});
