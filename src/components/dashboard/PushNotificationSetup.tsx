"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Download, Smartphone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IosInstallModal } from "@/components/dashboard/IosInstallModal";
import { usePwaInstall } from "@/components/dashboard/usePwaInstall";
import type { PushDeviceSummary } from "@/lib/push/device-label";
import {
  describePushFailure,
  getClientVapidPublicKey,
} from "@/lib/push/vapid";
import { isIosSafari, isStandaloneDisplay } from "@/lib/pwa/device";
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

  // Solo Safari real en iPhone/iPad exige app en inicio.
  // Chrome en Mac (aunque el UA diga iPhone) tiene PushManager y debe poder activar.
  if (isIosSafari() && (!hasPushManager || !isStandaloneDisplay())) {
    return "ios_install";
  }

  if (!hasPushManager) return "unsupported";

  return "ready";
}

async function getVapidPublicKey(): Promise<string | null> {
  return getClientVapidPublicKey();
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
  testPush: () => Promise<void>;
  removeDevice: (device: PushDeviceSummary) => Promise<void>;
  refreshDevices: () => Promise<void>;
  messageTone: "success" | "error" | "info";
};

export function usePushNotifications(): PushNotificationsState {
  const [environment, setEnvironment] = useState<PushEnvironment>("unsupported");
  const [checking, setChecking] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error" | "info">(
    "info",
  );
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

  async function runTestPush(showSuccess = true) {
    const currentEndpoint = await getCurrentPushEndpoint();
    const res = await fetch("/api/push/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        currentEndpoint ? { endpoint: currentEndpoint } : {},
      ),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      sent?: number;
      failed?: number;
      expired?: number;
      lastStatusCode?: number;
      vapidConfigured?: boolean;
      vapidHealthy?: boolean;
      error?: string;
    };

    if (res.ok && data.ok && (data.sent ?? 0) > 0) {
      if (showSuccess) {
        setMessageTone("success");
        setMessage(
          "Te enviamos una alerta de prueba. Si no la ves, bloqueá la pantalla un momento o revisá Ajustes → Notificaciones → SOSme.",
        );
      }
      return true;
    }

    setMessageTone("error");
    setMessage(
      describePushFailure({
        statusCode: data.lastStatusCode,
        expired: (data.expired ?? 0) > 0,
        vapidConfigured: data.vapidConfigured,
        vapidHealthy: data.vapidHealthy,
      }),
    );
    return false;
  }

  async function testPush() {
    setLoading(true);
    setMessage(null);
    try {
      await runTestPush(true);
    } finally {
      setLoading(false);
    }
  }

  async function subscribe() {
    if (environment !== "ready") {
      setMessageTone("info");
      setMessage(
        environment === "ios_install"
          ? "En este iPhone/iPad tenés que agregar SOSme a la pantalla de inicio y abrirlo desde ahí para activar alertas."
          : "Este navegador no permite alertas push. Probá con Chrome en Android o en la computadora.",
      );
      return;
    }

    setLoading(true);
    setMessage(null);
    setMessageTone("info");

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
      if (sub) {
        await sub.unsubscribe();
      }

      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

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

      const data = (await res.json()) as {
        testDelivered?: boolean;
        testStatusCode?: number;
        testExpired?: boolean;
      };

      setSubscribed(true);
      await refreshDevices();

      if (data.testDelivered) {
        setMessageTone("success");
        setMessage(
          "Te enviamos una alerta de prueba. Si no la ves, bloqueá la pantalla un momento o revisá Ajustes → Notificaciones → SOSme.",
        );
      } else {
        setMessageTone("error");
        setMessage(
          describePushFailure({
            statusCode: data.testStatusCode,
            expired: data.testExpired,
            vapidConfigured: true,
            vapidHealthy: true,
          }),
        );
      }
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
      setMessageTone("info");
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
    messageTone,
    devices,
    devicesLoading,
    subscribe,
    unsubscribe,
    testPush,
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
  // En iOS el CTA principal ya es “Cómo agregar al inicio”.
  if (push.environment === "ios_install") return null;

  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
      {pwa.canInstall ? (
        <>
          Para mejores alertas en el celular, agregá SOSme al inicio como app.
        </>
      ) : (
        <>
          Este navegador no soporta alertas push. Probá con{" "}
          <strong>Chrome en Android</strong> o en la computadora.
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

/** Solo se muestra si este dispositivo aún no tiene alertas push activas. */
export function PushNotificationPanel({ push }: PushProps) {
  const pwa = usePwaInstall();
  if (push.checking) {
    return (
      <section className="rounded-2xl border border-violet-200/80 bg-white px-5 py-4 shadow-lg shadow-violet-500/10">
        <p className="text-sm text-neutral-500">Comprobando alertas push...</p>
      </section>
    );
  }

  if (push.subscribed) return null;

  const hasAccountDevices = push.devices.length > 0;
  const canActivateHere = push.environment === "ready";
  const needsIosInstall = push.environment === "ios_install";

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-200/80 bg-white shadow-lg shadow-violet-500/10">
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50/80 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/30">
              <Bell className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-bold text-violet-950">
                {needsIosInstall
                  ? "Agregá SOSme al inicio para activar alertas"
                  : hasAccountDevices
                    ? "Activá alertas también en este dispositivo"
                    : "Activá las alertas push"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-violet-800/90">
                {needsIosInstall
                  ? "En iPhone/iPad Safari no permite push desde una pestaña. Instalá la app en inicio y abrila desde el ícono."
                  : hasAccountDevices
                    ? "Tu cuenta ya recibe alertas en otros dispositivos. Podés sumar este también."
                    : "Recibí avisos al instante cuando escaneen el QR, haya SOS o un mensaje nuevo."}
              </p>
            </div>
          </div>

          {canActivateHere ? (
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
          ) : needsIosInstall ? (
            <Button
              type="button"
              size="sm"
              disabled={pwa.installing}
              onClick={() => void pwa.install()}
              className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md hover:from-violet-700 hover:to-indigo-700"
            >
              <Download className="h-4 w-4" aria-hidden />
              Cómo agregar al inicio
            </Button>
          ) : null}
        </div>

        <PushEnvironmentNotice push={push} pwa={pwa} />

        <IosInstallModal
          open={pwa.iosGuideOpen}
          onClose={() => pwa.setIosGuideOpen(false)}
        />

        {push.message && (
          <p
            className={`mt-3 text-sm ${
              push.messageTone === "success"
                ? "text-green-800"
                : push.messageTone === "error"
                  ? "text-red-700"
                  : "text-violet-800"
            }`}
            role="alert"
          >
            {push.message}
          </p>
        )}
      </div>
    </section>
  );
}

/** Lista de dispositivos con alertas; va al final del panel. */
export function PushDevicesSection({ push }: PushProps) {
  if (push.checking) return null;

  const hasAccountDevices = push.devices.length > 0;
  if (!hasAccountDevices && !push.subscribed) return null;

  const otherDevices = push.devices.filter((device) => !device.isCurrent);
  const canSubscribe = push.environment === "ready";

  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-neutral-900">Dispositivos</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Cada navegador o celular donde activaste notificaciones para esta cuenta.
            </p>
          </div>
          {push.subscribed && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={push.loading || !canSubscribe}
                onClick={push.testPush}
                className="gap-1"
              >
                <Bell className="h-4 w-4" aria-hidden />
                {push.loading ? "Enviando..." : "Probar alerta"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={push.loading || !canSubscribe}
                onClick={push.unsubscribe}
                className="gap-1 text-neutral-700 hover:bg-neutral-100"
              >
                <BellOff className="h-4 w-4" aria-hidden />
                Desactivar
              </Button>
            </div>
          )}
        </div>

        {push.message && push.subscribed && (
          <p
            className={`mt-3 text-sm ${
              push.messageTone === "success"
                ? "text-green-800"
                : push.messageTone === "error"
                  ? "text-red-700"
                  : "text-neutral-700"
            }`}
            role="status"
          >
            {push.message}
          </p>
        )}
      </div>

      <div className="px-5 py-4">
        {push.devicesLoading ? (
          <p className="text-sm text-neutral-500">Cargando dispositivos...</p>
        ) : hasAccountDevices ? (
          <ul className="space-y-2">
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
        ) : (
          <p className="text-sm text-neutral-500">
            Todavía no hay dispositivos con alertas registradas.
          </p>
        )}

        {otherDevices.length === 0 && push.subscribed && hasAccountDevices && (
          <p className="mt-3 text-xs text-neutral-500">
            Solo este dispositivo tiene alertas activas por ahora.
          </p>
        )}
      </div>
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
