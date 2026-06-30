self.addEventListener("push", (event) => {
  let data = { title: "SOS Alerta", body: "Nuevo evento en tu perfil", url: "/" };
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    /* use defaults */
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/globe.svg",
      badge: "/globe.svg",
      data: { url: data.url ?? "/" },
      tag: "sos-alert",
      renotify: true,
    }),
  );
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
  const raw = event.notification.data?.url ?? "/dashboard";
  const url = isSafeUrl(raw) ? raw : "/dashboard";
  event.waitUntil(clients.openWindow(url));
});
