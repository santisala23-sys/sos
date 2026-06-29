"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function getVapidPublicKey(): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  }
  const keyRes = await fetch("/api/push/vapid-public-key");
  const { publicKey } = await keyRes.json();
  return publicKey ?? null;
}

async function registerServiceWorker() {
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  return reg;
}

async function detectPushSubscription(): Promise<boolean> {
  if (Notification.permission !== "granted") return false;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return Boolean(sub);
}

export type PushNotificationsState = {
  supported: boolean;
  checking: boolean;
  subscribed: boolean;
  loading: boolean;
  message: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
};

export function usePushNotifications(): PushNotificationsState {
  const [supported, setSupported] = useState(false);
  const [checking, setChecking] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    const active = await detectPushSubscription();
    setSubscribed(active);
    return active;
  }, []);

  useEffect(() => {
    const ok =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setSupported(ok);

    if (!ok) {
      setChecking(false);
      return;
    }

    refreshStatus().finally(() => setChecking(false));
  }, [refreshStatus]);

  async function subscribe() {
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
        setMessage("Push no configurado en el servidor (VAPID).");
        return;
      }

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      if (!res.ok) {
        setMessage("No se pudo guardar la suscripción.");
        return;
      }

      setSubscribed(true);
      setMessage(null);
    } catch {
      setMessage("Error al activar notificaciones.");
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
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
      setMessage("Notificaciones desactivadas en este dispositivo.");
    } finally {
      setLoading(false);
    }
  }

  return {
    supported,
    checking,
    subscribed,
    loading,
    message,
    subscribe,
    unsubscribe,
  };
}

type PushProps = { push: PushNotificationsState };

export function PushNotificationAlert({ push }: PushProps) {
  if (!push.supported || push.checking || push.subscribed) return null;

  return (
    <section className="rounded-xl border-2 border-violet-300 bg-violet-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" aria-hidden />
        <div className="flex-1">
          <p className="font-bold text-violet-900">Activá las alertas push</p>
          <p className="mt-1 text-sm text-violet-800/90">
            Recibí avisos al instante cuando escaneen el QR, haya SOS o un mensaje
            nuevo. Solo tenés que hacerlo una vez en este dispositivo.
          </p>
          <Button
            type="button"
            size="sm"
            disabled={push.loading}
            onClick={push.subscribe}
            className="mt-3 gap-1"
          >
            <Bell className="h-4 w-4" aria-hidden />
            {push.loading ? "Activando..." : "Activar alertas push"}
          </Button>
          {push.message && (
            <p className="mt-2 text-sm text-red-700" role="alert">
              {push.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export function PushNotificationFooter({ push }: PushProps) {
  if (!push.supported || push.checking || !push.subscribed) return null;

  return (
    <section className="rounded-xl border border-green-200 bg-green-50/80 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-green-900">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
          <span>
            <strong>Alertas push activas</strong> en este dispositivo
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={push.loading}
          onClick={push.unsubscribe}
          className="gap-1 text-green-800 hover:bg-green-100"
        >
          <BellOff className="h-4 w-4" aria-hidden />
          Desactivar
        </Button>
      </div>
      {push.message && <p className="mt-2 text-xs text-green-800">{push.message}</p>}
    </section>
  );
}
