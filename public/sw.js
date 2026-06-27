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

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard";
  event.waitUntil(clients.openWindow(url));
});
