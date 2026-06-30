"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  clearScannerPushRegistered,
  isScannerPushRegistered,
  markScannerPushRegistered,
  scannerAuthHeaders,
} from "@/lib/scan-session/storage";
import {
  isPushSupported,
  subscribeBrowserPush,
} from "@/lib/push/client";

type ScannerPushPromptProps = {
  scanToken: string;
  scanLogId: string;
  dark?: boolean;
};

export function ScannerPushPrompt({
  scanToken,
  scanLogId,
  dark = false,
}: ScannerPushPromptProps) {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [scannerRegistered, setScannerRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const ok = isPushSupported();
    setSupported(ok);
    if (!ok) return;
    setPermission(Notification.permission);
    setScannerRegistered(isScannerPushRegistered(scanLogId));
  }, [scanLogId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function registerScannerPush(sub: PushSubscription) {
    const res = await fetch("/api/push/scanner-subscribe", {
      method: "POST",
      headers: scannerAuthHeaders(scanToken),
      body: JSON.stringify(sub.toJSON()),
    });
    if (!res.ok) throw new Error("save failed");
    markScannerPushRegistered(scanLogId);
    setScannerRegistered(true);
  }

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const sub = await subscribeBrowserPush();
      if (!sub) {
        setPermission(Notification.permission);
        setError(
          Notification.permission === "denied"
            ? "Las notificaciones están bloqueadas. Activálas en ajustes del navegador."
            : "No se pudo activar. Revisá los permisos del navegador.",
        );
        return;
      }

      await registerScannerPush(sub);
      setPermission("granted");
    } catch {
      setError("Error al activar notificaciones.");
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
        await fetch("/api/push/scanner-subscribe", {
          method: "DELETE",
          headers: scannerAuthHeaders(scanToken),
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      clearScannerPushRegistered(scanLogId);
      setScannerRegistered(false);
    } finally {
      setLoading(false);
    }
  }

  if (dismissed) return null;

  if (!supported) {
    return (
      <p
        className={`rounded-xl px-4 py-3 text-sm ${
          dark ? "bg-neutral-900 text-neutral-400" : "bg-neutral-100 text-neutral-600"
        }`}
      >
        Este navegador no soporta notificaciones push. Podés seguir chateando acá.
      </p>
    );
  }

  if (scannerRegistered && permission === "granted") {
    return (
      <div
        className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm ${
          dark
            ? "border border-green-800 bg-green-950/80 text-green-100"
            : "border border-green-200 bg-green-50 text-green-900"
        }`}
      >
        <span className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          Te avisamos cuando la familia responda
        </span>
        <button
          type="button"
          onClick={handleUnsubscribe}
          disabled={loading}
          className={`text-xs underline-offset-2 hover:underline ${
            dark ? "text-green-300" : "text-green-700"
          }`}
        >
          Desactivar
        </button>
      </div>
    );
  }

  return (
    <section
      className={`rounded-xl border-2 px-4 py-4 ${
        dark
          ? "border-violet-500 bg-violet-950/80"
          : "border-violet-200 bg-violet-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <Bell
          className={`mt-0.5 h-5 w-5 shrink-0 ${dark ? "text-violet-300" : "text-violet-600"}`}
          aria-hidden
        />
        <div className="flex-1">
          <p
            className={`font-bold ${dark ? "text-violet-100" : "text-violet-900"}`}
          >
            Recibí avisos de la familia
          </p>
          <p
            className={`mt-1 text-sm ${dark ? "text-violet-200/90" : "text-violet-800"}`}
          >
            Activá las notificaciones para que te avise cuando respondan en el chat,
            aunque cierres esta página.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={loading}
              onClick={handleSubscribe}
              className="gap-1 bg-violet-600 hover:bg-violet-500"
            >
              <Bell className="h-4 w-4" aria-hidden />
              {loading ? "Activando..." : "Activar notificaciones"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className={dark ? "text-violet-200" : "text-violet-700"}
            >
              Ahora no
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
