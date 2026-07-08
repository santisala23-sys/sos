"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  Bell,
  CheckCircle2,
  FileDown,
  Plus,
  QrCode,
  Sparkles,
  UserX,
  UserCircle2,
} from "lucide-react";
import type { QrProfile, ScanLogWithProfile } from "@/types/database";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { ActivateCodeInput } from "@/components/dashboard/ActivateCodeInput";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { LegalAcceptanceBanner } from "@/components/dashboard/LegalAcceptanceBanner";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import {
  PushNotificationAlert,
  PushNotificationFooter,
  usePushNotifications,
} from "@/components/dashboard/PushNotificationSetup";
import { ScanLogsList } from "@/components/dashboard/ScanLogsList";
import { QrProfileForm } from "@/components/dashboard/QrProfileForm";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<QrProfile[]>([]);
  const [logs, setLogs] = useState<ScanLogWithProfile[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showActivateCode, setShowActivateCode] = useState(false);
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);
  const [legalStatus, setLegalStatus] = useState<{
    needsAcceptance: boolean;
    currentVersion: string;
    userVersion: string | null;
  } | null>(null);
  const [planStatus, setPlanStatus] = useState<{
    planName: string;
    maxProfiles: number;
    currentCount: number;
    activeCount?: number;
    canCreateMore: boolean;
  } | null>(null);
  const push = usePushNotifications();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [accountMsg, setAccountMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [profilesRes, logsRes] = await Promise.all([
      fetch("/api/qr-profiles"),
      fetch("/api/scan-logs"),
    ]);

    if (profilesRes.ok) {
      const data = await profilesRes.json();
      setProfiles(data.profiles ?? []);
    }

    if (logsRes.ok) {
      const data = await logsRes.json();
      setLogs(data.logs ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.legal) setLegalStatus(d.legal);
        if (d?.plan) setPlanStatus(d.plan);
      })
      .catch(() => {
        setLegalStatus(null);
        setPlanStatus(null);
      });
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const activatedSlug = params.get("activado");
    if (activatedSlug) setHighlightedSlug(activatedSlug);
  }, []);

  const latestUnread = logs.find((l) => !l.read_at);
  const legalBlocked = legalStatus?.needsAcceptance ?? false;
  const atProfileLimit = planStatus != null && !planStatus.canCreateMore;
  const activeProfilesCount = loading
    ? null
    : profiles.reduce((acc, p) => (p.is_active ? acc + 1 : acc), 0);
  async function handleExport() {
    setExporting(true);
    setAccountMsg(null);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAccountMsg(data.error ?? "No se pudo exportar");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sosme-export-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setAccountMsg("Exportación generada.");
    } catch {
      setAccountMsg("Error de conexión");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteRequest() {
    const ok = window.confirm(
      "¿Querés solicitar la baja de tu cuenta? Se programará la eliminación/anonimización según la política de retención.",
    );
    if (!ok) return;
    setDeleting(true);
    setAccountMsg(null);
    try {
      const res = await fetch("/api/account/delete-request", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAccountMsg(data.error ?? "No se pudo solicitar la baja");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setAccountMsg("Error de conexión");
    } finally {
      setDeleting(false);
    }
  }
  const activatedProfile = highlightedSlug
    ? profiles.find((p) => p.slug === highlightedSlug)
    : null;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 p-6 text-white shadow-2xl shadow-violet-600/30 sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.35) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
            <Sparkles className="h-4 w-4" aria-hidden />
            Tu espacio SOSme
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Hola, este es tu panel
          </h1>
          <p className="mt-2 max-w-xl text-base text-violet-100 sm:text-lg">
            Gestioná perfiles QR, revisá escaneos y mantené tus contactos de
            emergencia siempre actualizados.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-200">
                <QrCode className="h-4 w-4" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Activos
                </span>
              </div>
              <p className="mt-2 text-2xl font-black">
                {loading ? "—" : (planStatus?.activeCount ?? activeProfilesCount ?? 0)}
                {planStatus && (
                  <span className="text-lg font-semibold text-violet-200">
                    /{planStatus.currentCount}
                  </span>
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-200">
                <Bell className="h-4 w-4" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Alertas nuevas
                </span>
              </div>
              <p className="mt-2 text-2xl font-black">
                {loading ? "—" : unreadCount}
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-200">
                <Activity className="h-4 w-4" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Plan
                </span>
              </div>
              <p className="mt-2 text-lg font-bold leading-tight">
                {planStatus?.planName ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {legalStatus?.needsAcceptance && (
        <LegalAcceptanceBanner
          currentVersion={legalStatus.currentVersion}
          userVersion={legalStatus.userVersion}
          onAccepted={() =>
            setLegalStatus({
              ...legalStatus,
              needsAcceptance: false,
              userVersion: legalStatus.currentVersion,
            })
          }
        />
      )}

      {!loading && unreadCount > 0 && !legalBlocked && (
        <AlertBanner unreadCount={unreadCount} latestLogId={latestUnread?.id} />
      )}

      <PushNotificationAlert push={push} />

      {!loading && activatedProfile && !legalBlocked && (
        <div className="flex items-start gap-4 rounded-2xl border border-green-200/80 bg-gradient-to-r from-green-50 to-emerald-50 p-5 shadow-lg shadow-green-500/10">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white shadow-md">
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-bold text-green-900">QR activado correctamente</p>
            <p className="mt-1 text-sm leading-relaxed text-green-800">
              El perfil <strong>{activatedProfile.beneficiary_name}</strong> está
              listo. Descargá el PNG con &quot;Ver QR&quot;.
            </p>
          </div>
        </div>
      )}

      <DashboardSection
        id="perfiles"
        icon={UserCircle2}
        title="Mis perfiles"
        description="Cada perfil tiene su QR, contactos de emergencia y modo solo SOS."
        disabled={legalBlocked}
      >
        {loading ? (
          <div className="space-y-3">
            <div className="h-32 animate-pulse rounded-2xl bg-violet-50" />
            <div className="h-32 animate-pulse rounded-2xl bg-violet-50" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-neutral-900">
              Creá tu primer perfil QR
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Plan gratis: 1 perfil para persona, mascota u objeto. ¿Necesitás más?{" "}
              <Link
                href="/pricing"
                className="font-semibold text-violet-700 underline-offset-2 hover:underline"
              >
                Ver planes
              </Link>{" "}
              o{" "}
              <Link
                href="/contacto"
                className="font-semibold text-violet-700 underline-offset-2 hover:underline"
              >
                contactanos
              </Link>
              .
            </p>
            <div className="mt-6 rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
              <QrProfileForm onSuccess={loadData} />
            </div>
            <details className="mt-6 overflow-hidden rounded-2xl border border-violet-100 bg-white">
              <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-neutral-700 transition-colors hover:bg-violet-50/50">
                ¿Tenés un código en un colgante o producto?
              </summary>
              <div className="border-t border-violet-100 px-5 py-5">
                <ActivateCodeInput buttonLabel="Ir a activar" />
              </div>
            </details>
          </div>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-2">
              {profiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onRefresh={loadData}
                  defaultShowQr={profile.slug === highlightedSlug}
                />
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <details
                className="overflow-hidden rounded-2xl border border-violet-100 bg-violet-50/40 transition-colors open:bg-white"
                open={showActivateCode}
                onToggle={(e) =>
                  setShowActivateCode((e.target as HTMLDetailsElement).open)
                }
              >
                <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-neutral-800 transition-colors hover:bg-violet-50/80">
                  Activar código de colgante o producto
                </summary>
                <div className="border-t border-violet-100 px-5 py-5">
                  <ActivateCodeInput buttonLabel="Ir a activar" />
                </div>
              </details>

              <details
                className="overflow-hidden rounded-2xl border border-violet-100 bg-violet-50/40 transition-colors open:bg-white"
                open={showAddForm && !atProfileLimit}
                onToggle={(e) => {
                  const open = (e.target as HTMLDetailsElement).open;
                  if (atProfileLimit && open) {
                    router.push("/pricing");
                    return;
                  }
                  setShowAddForm(open);
                }}
              >
                <summary
                  className="flex cursor-pointer items-center gap-2 px-5 py-4 text-sm font-semibold text-neutral-800 transition-colors hover:bg-violet-50/80"
                  onClick={(e) => {
                    if (atProfileLimit) {
                      e.preventDefault();
                      router.push("/pricing");
                    }
                  }}
                >
                  <Plus className="h-4 w-4 text-violet-600" aria-hidden />
                  Crear perfil QR nuevo
                </summary>
                {!atProfileLimit && (
                  <div className="border-t border-violet-100 px-5 py-5">
                    <QrProfileForm
                      onSuccess={() => {
                        loadData();
                        setShowAddForm(false);
                      }}
                      onCancel={() => setShowAddForm(false)}
                    />
                  </div>
                )}
              </details>
            </div>
          </>
        )}
      </DashboardSection>

      <DashboardSection
        id="actividad"
        icon={Activity}
        title="Actividad reciente"
        description="Escaneos, alertas SOS y mensajes de quien leyó tu QR."
        disabled={legalBlocked}
      >
        {loading ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-2xl bg-violet-50" />
            <div className="h-20 animate-pulse rounded-2xl bg-violet-50" />
          </div>
        ) : (
          <ScanLogsList logs={logs} />
        )}
      </DashboardSection>

      <PushNotificationFooter push={push} />

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-neutral-900">Cuenta</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Podés descargar una copia de tus datos o solicitar la baja de tu cuenta.
        </p>
        {accountMsg && (
          <p className="mt-3 text-sm text-neutral-700" role="status">
            {accountMsg}
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            disabled={exporting}
            onClick={handleExport}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" aria-hidden />
            {exporting ? "Generando..." : "Descargar mis datos"}
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={deleting}
            onClick={handleDeleteRequest}
            className="gap-2"
          >
            <UserX className="h-4 w-4" aria-hidden />
            {deleting ? "Procesando..." : "Solicitar baja de cuenta"}
          </Button>
        </div>
      </section>
    </main>
  );
}
