"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function PushNotificationSetup() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setSupported(
      "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window,
    );
  }, []);

  async function registerServiceWorker() {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    return reg;
  }

  async function getVapidPublicKey(): Promise<string | null> {
    if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    }
    const keyRes = await fetch("/api/push/vapid-public-key");
    const { publicKey } = await keyRes.json();
    return publicKey ?? null;
  }

  async function handleSubscribe() {
    setLoading(true);
    setMessage(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Permiso de notificaciones denegado.");
        return;
      }

      const reg = await registerServiceWorker();
      const publicKey = await getVapidPublicKey();

      if (!publicKey) {
        setMessage(
          "Push no configurado: faltan NEXT_PUBLIC_VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY en el servidor. En Vercel → Settings → Environment Variables, o reiniciá npm run dev si acabás de editar .env.local.",
        );
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) {
        setMessage("No se pudo guardar la suscripción.");
        return;
      }

      setSubscribed(true);
      setMessage("Alertas push activadas en este dispositivo.");
    } catch {
      setMessage("Error al activar notificaciones.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsubscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      setMessage("Notificaciones desactivadas.");
    } finally {
      setLoading(false);
    }
  }

  if (!supported) return null;

  return (
    <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" aria-hidden />
        <div className="flex-1">
          <p className="font-semibold text-blue-900">Alertas push en el celular</p>
          <p className="mt-1 text-sm text-blue-800/80">
            Recibí avisos al instante cuando escaneen el QR, haya SOS o una nota
            nueva.
          </p>
          <div className="mt-3">
            {subscribed ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={loading}
                onClick={handleUnsubscribe}
                className="gap-1"
              >
                <BellOff className="h-4 w-4" aria-hidden />
                Desactivar
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled={loading}
                onClick={handleSubscribe}
                className="gap-1"
              >
                <Bell className="h-4 w-4" aria-hidden />
                {loading ? "Activando..." : "Activar alertas push"}
              </Button>
            )}
          </div>
          {message && (
            <p className="mt-2 text-sm text-blue-900">{message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
