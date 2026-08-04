"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, CheckCircle2, Download, Smartphone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IosInstallModal } from "@/components/dashboard/IosInstallModal";
import { usePwaInstall } from "@/components/dashboard/usePwaInstall";
import type { PushDeviceSummary } from "@/lib/push/device-label";
import { isIosDevice, isStandaloneDisplay } from "@/lib/pwa/device";
import { formatDateTime } from "@/lib/utils/format";

export type PushEnvironment = "ready" | "ios_install" | "unsupported";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function detectPushEnvironment(): PushEnvironment {
  if (typeof window === "undefined") return "unsupported";

  const hasNotification = "Notification" in window;
  const hasServiceWorker = "serviceWorker" in navigator;
  const hasPushManager = "PushManager" in window;

  if (!hasNotification || !hasServiceWorker) return "unsupported";

  if (isIosDevice() && (!hasPushManager || !isStandaloneDisplay())) {
    return "ios_install";
  }

  if (!hasPushManager) return "unsupported";

  return "ready";
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

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  try {
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      reg = await registerServiceWorker();
    }
    await navigator.serviceWorker.ready;
    return reg;
  } catch {
    return null;
  }
}

async function getCurrentPushEndpoint(): Promise<string | null> {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return null;
  }

  try {
    const reg = await getServiceWorkerRegistration();
    const sub = await reg?.pushManager.getSubscription();
    return sub?.endpoint ?? null;
  } catch {
    return null;
  }
}

async function detectPushSubscription(): Promise<boolean> {
  return Boolean(await getCurrentPushEndpoint());
}

export type PushNotificationsState = {
  environment: PushEnvironment;
  checking: boolean;
  subscribed: boolean;
  loading: boolean;
  message: string | null;
  devices: PushDeviceSummary[];
  devicesLoading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  removeDevice: (device: PushDeviceSummary) => Promise<void>;
  refreshDevices: () => Promise<void>;
};

export function usePushNotifications(): PushNotificationsState {
  const [environment, setEnvironment] = useState<PushEnvironment>("unsupported");
  const [checking, setChecking] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devices, setDevices] = useState<PushDeviceSummary[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  const refreshDevices = useCallback(async () => {
    setDevicesLoading(true);
    try {
      const currentEndpoint = await getCurrentPushEndpoint();
      const params = currentEndpoint
        ? `?currentEndpoint=${encodeURIComponent(currentEndpoint)}`
        : "";
      const res = await fetch(`/api/push/subscribe${params}`);
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices ?? []);
      }
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    const env = detectPushEnvironment();
    setEnvironment(env);

    const active = env === "ready" ? await detectPushSubscription() : false;
    setSubscribed(active);
    await refreshDevices();
    return active;
  }, [refreshDevices]);

  useEffect(() => {
    refreshStatus().finally(() => setChecking(false));

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshStatus();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [refreshStatus]);

  async function subscribe() {
    if (environment !== "ready") {
      setMessage(
        environment === "ios_install"
          ? "En iPhone, usá “Cómo agregar al inicio” y abrí SOSme desde el ícono para activar alertas."
          : "Este navegador no permite alertas push. Probá con Chrome o agregá la app a inicio.",
      );
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Permiso de notificaciones denegado.");
        return;
      }

      const reg = await getServiceWorkerRegistration();
      if (!reg) {
        setMessage("No se pudo preparar las notificaciones en este dispositivo.");
        return;
      }

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
        body: JSON.stringify({
          ...sub.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        setMessage("No se pudo guardar la suscripción.");
        return;
      }

      setSubscribed(true);
      setMessage(null);
      await refreshDevices();

      void fetch("/api/push/test", { method: "POST" }).catch(() => {
        /* best effort */
      });
    } catch {
      setMessage("Error al activar notificaciones.");
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    setLoading(true);
    try {
      const reg = await getServiceWorkerRegistration();
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
      await refreshDevices();
    } finally {
      setLoading(false);
    }
  }

  async function removeDevice(device: PushDeviceSummary) {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: device.id }),
      });
      if (!res.ok) {
        setMessage("No se pudo quitar ese dispositivo.");
        return;
      }

      if (device.isCurrent) {
        const reg = await getServiceWorkerRegistration();
        const sub = await reg?.pushManager.getSubscription();
        await sub?.unsubscribe();
        setSubscribed(false);
        setMessage("Notificaciones desactivadas en este dispositivo.");
      }

      await refreshDevices();
    } finally {
      setLoading(false);
    }
  }

  return {
    environment,
    checking,
    subscribed,
    loading,
    message,
    devices,
    devicesLoading,
    subscribe,
    unsubscribe,
    removeDevice,
    refreshDevices,
  };
}

type PushProps = { push: PushNotificationsState };

type PwaInstallState = ReturnType<typeof usePwaInstall>;

function PushEnvironmentNotice({
  push,
  pwa,
}: PushProps & { pwa: PwaInstallState }) {
  if (push.environment === "ready" && !pwa.canInstall) return null;

  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
      {push.environment === "ios_install" ? (
        <>
          <strong className="font-semibold">En iPhone/iPad</strong> hace falta tener
          SOSme en la pantalla de inicio para activar alertas push. Safari en pestaña
          no las permite.
        </>
      ) : pwa.canInstall ? (
        <>
          Para mejores alertas en el celular, agregá SOSme al inicio como app.
        </>
      ) : (
        <>
          Este navegador no soporta alertas push. Probá con{" "}
          <strong>Chrome en Android</strong> o agregá SOSme a la pantalla de inicio.
        </>
      )}

      {pwa.canInstall && (
        <Button
          type="button"
          size="sm"
          disabled={pwa.installing}
          onClick={() => void pwa.install()}
          className="mt-3 gap-1.5 bg-amber-700 hover:bg-amber-800"
        >
          <Download className="h-4 w-4" aria-hidden />
          {pwa.installing
            ? "Instalando..."
            : pwa.isIos
              ? "Cómo agregar al inicio"
              : "Agregar al inicio"}
        </Button>
      )}
    </div>
  );
}

export function PushNotificationPanel({ push }: PushProps) {
  const pwa = usePwaInstall();
  if (push.checking) {
    return (
      <section className="rounded-2xl border border-violet-200/80 bg-white px-5 py-4 shadow-lg shadow-violet-500/10">
        <p className="text-sm text-neutral-500">Comprobando alertas push...</p>
      </section>
    );
  }

  const otherDevices = push.devices.filter((device) => !device.isCurrent);
  const hasAccountDevices = push.devices.length > 0;
  const canSubscribe = push.environment === "ready";

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-200/80 bg-white shadow-lg shadow-violet-500/10">
      <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50/80 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/30">
              {push.subscribed ? (
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              ) : (
                <Bell className="h-5 w-5" aria-hidden />
              )}
            </span>
            <div>
              {push.subscribed ? (
                <>
                  <p className="font-bold text-green-900">
                    Alertas push activas en este dispositivo
                  </p>
                  <p className="mt-1 text-sm text-green-800/90">
                    Vas a recibir escaneos, SOS y mensajes nuevos acá.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-violet-950">
                    {hasAccountDevices
                      ? "Activá alertas también en este dispositivo"
                      : "Activá las alertas push"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-violet-800/90">
                    {hasAccountDevices
                      ? "Tu cuenta ya recibe alertas en otros dispositivos. Podés sumar este también."
                      : "Recibí avisos al instante cuando escaneen el QR, haya SOS o un mensaje nuevo."}
                  </p>
                </>
              )}
            </div>
          </div>

          {push.subscribed ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={push.loading || !canSubscribe}
              onClick={push.unsubscribe}
              className="gap-1 text-green-800 hover:bg-green-100"
            >
              <BellOff className="h-4 w-4" aria-hidden />
              Desactivar
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={push.loading}
              onClick={push.subscribe}
              className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md hover:from-violet-700 hover:to-indigo-700"
            >
              <Bell className="h-4 w-4" aria-hidden />
              {push.loading ? "Activando..." : "Activar alertas push"}
            </Button>
          )}
        </div>

        <PushEnvironmentNotice push={push} pwa={pwa} />

        <IosInstallModal
          open={pwa.iosGuideOpen}
          onClose={() => pwa.setIosGuideOpen(false)}
        />

        {push.message && (
          <p
            className={`mt-3 text-sm ${push.subscribed ? "text-green-800" : "text-red-700"}`}
            role="alert"
          >
            {push.message}
          </p>
        )}
      </div>

      {hasAccountDevices && (
        <div className="px-5 py-4">
          <h3 className="text-sm font-bold text-neutral-900">
            Dispositivos con alertas activas
          </h3>
          <p className="mt-1 text-xs text-neutral-500">
            Cada navegador o celular donde activaste notificaciones para esta cuenta.
          </p>

          {push.devicesLoading ? (
            <p className="mt-3 text-sm text-neutral-500">Cargando dispositivos...</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {push.devices.map((device) => (
                <li
                  key={device.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 bg-neutral-50/80 px-3 py-3"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-violet-700 shadow-sm">
                      <Smartphone className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {device.label}
                        {device.isCurrent && (
                          <span className="ml-2 inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-800">
                            Este dispositivo
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        Activo desde {formatDateTime(device.createdAt)}
                      </p>
                    </div>
                  </div>
                  {!device.isCurrent && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={push.loading}
                      onClick={() => push.removeDevice(device)}
                      className="shrink-0 gap-1 text-neutral-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Quitar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {otherDevices.length === 0 && push.subscribed && (
            <p className="mt-3 text-xs text-neutral-500">
              Solo este dispositivo tiene alertas activas por ahora.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

/** @deprecated Usar PushNotificationPanel */
export function PushNotificationAlert({ push }: PushProps) {
  return null;
}

/** @deprecated Usar PushNotificationPanel */
export function PushNotificationFooter({ push }: PushProps) {
  return null;
}
