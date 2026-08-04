"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  FileDown,
  PawPrint,
  Plus,
  Package,
  QrCode,
  UserX,
  UserCircle2,
} from "lucide-react";
import type { QrProfile, ScanLogWithProfile } from "@/types/database";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { QrActivationScanner } from "@/components/dashboard/QrActivationScanner";
import { LegalAcceptanceBanner } from "@/components/dashboard/LegalAcceptanceBanner";
import { PetCard } from "@/components/dashboard/PetCard";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import {
  PushNotificationPanel,
  usePushNotifications,
} from "@/components/dashboard/PushNotificationSetup";
import { QrProfileForm } from "@/components/dashboard/QrProfileForm";
import { ObjectSavedLocationsBanner } from "@/components/dashboard/ObjectSavedLocationsBanner";
import type { ProfileType } from "@/lib/profile-types";
import {
  sortProfileSections,
} from "@/lib/dashboard/profile-section-order";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<QrProfile[]>([]);
  const [logs, setLogs] = useState<ScanLogWithProfile[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
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
    const [profilesRes, logsRes, meRes] = await Promise.all([
      fetch("/api/qr-profiles"),
      fetch("/api/scan-logs"),
      fetch("/api/auth/me"),
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

    if (meRes.ok) {
      const data = await meRes.json();
      if (data?.legal) setLegalStatus(data.legal);
      if (data?.plan) setPlanStatus(data.plan);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const activatedSlug = params.get("activado");
    if (activatedSlug) setHighlightedSlug(activatedSlug);
  }, []);

  useEffect(() => {
    if (window.location.hash === "#perfiles") {
      window.history.replaceState(null, "", "/dashboard#personas");
    }
  }, []);

  const latestUnread = logs.find((l) => !l.read_at);
  const legalBlocked = legalStatus?.needsAcceptance ?? false;
  const atProfileLimit = planStatus != null && !planStatus.canCreateMore;
  const activeProfilesCount = loading
    ? null
    : profiles.reduce((acc, p) => (p.is_active ? acc + 1 : acc), 0);
  const personProfiles = profiles.filter((p) => p.profile_type === "person");
  const objectProfiles = profiles.filter((p) => p.profile_type === "object");
  const petProfiles = profiles.filter((p) => p.profile_type === "pet");
  const hasAnyProfiles = profiles.length > 0;

  const profileCounts: Record<ProfileType, number> = {
    person: personProfiles.length,
    object: objectProfiles.length,
    pet: petProfiles.length,
  };
  const orderedSections = sortProfileSections(profileCounts);

  const profilesByType: Record<ProfileType, QrProfile[]> = {
    person: personProfiles,
    object: objectProfiles,
    pet: petProfiles,
  };

  const sectionMeta: Record<
    ProfileType,
    {
      id: string;
      title: string;
      description: string;
      icon: typeof UserCircle2;
      emptyTitle: string;
      emptyBody: ReactNode;
    }
  > = {
    person: {
      id: "personas",
      title: "Personas",
      description:
        "Perfiles QR de emergencia con contactos, alertas SOS y datos médicos.",
      icon: UserCircle2,
      emptyTitle: "Todavía no tenés perfiles de persona",
      emptyBody:
        "Creá un perfil para vos o un familiar con contactos de emergencia y alertas.",
    },
    object: {
      id: "objetos",
      title: "Objetos",
      description:
        "Autos, valijas y equipos con QR. Guardá ubicación y contacto del dueño.",
      icon: Package,
      emptyTitle: "Todavía no tenés objetos",
      emptyBody:
        "Marcá valijas, autos u otros objetos con QR para recuperarlos si se pierden.",
    },
    pet: {
      id: "mascotas",
      title: "Mascotas",
      description:
        "Libreta sanitaria, vacunas, visitas veterinarias y QR de emergencia.",
      icon: PawPrint,
      emptyTitle: "Todavía no tenés mascotas",
      emptyBody: (
        <>
          Creá un perfil con tipo <strong>Mascota</strong> o activá el QR de un
          collar/chapita.
        </>
      ),
    },
  };

  function handleCreateProfile() {
    if (atProfileLimit) {
      router.push("/contacto");
      return;
    }
    router.push("/dashboard/perfiles/nuevo");
  }

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
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Hola, este es tu panel
          </h1>
          <p className="mt-2 max-w-xl text-base text-violet-100 sm:text-lg">
            Gestioná perfiles QR de emergencia, la libreta de tus mascotas y
            las alertas de escaneo.
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
            <div
              className={`rounded-2xl border px-4 py-4 backdrop-blur-sm ${
                !loading && unreadCount > 0
                  ? "border-red-300/70 bg-red-500/15"
                  : "border-white/20 bg-white/10"
              }`}
            >
              <div
                className={`flex items-center gap-2 ${
                  !loading && unreadCount > 0 ? "text-red-100" : "text-violet-200"
                }`}
              >
                <Bell className="h-4 w-4" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Alertas nuevas
                </span>
              </div>
              <p
                className={`mt-2 text-2xl font-black ${
                  !loading && unreadCount > 0 ? "text-white" : ""
                }`}
              >
                {loading ? "—" : unreadCount}
              </p>
              {!loading && unreadCount > 0 && (
                <Link
                  href="/dashboard/actividad"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50"
                >
                  Ver alerta
                </Link>
              )}
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

          {!legalBlocked && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleCreateProfile}
                className="flex items-center gap-3 rounded-2xl border border-white/30 bg-white px-5 py-4 text-left text-violet-900 shadow-lg transition hover:bg-violet-50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
                  <Plus className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-base font-black">Crear perfil QR nuevo</span>
                  <span className="mt-0.5 block text-sm text-violet-700/80">
                    Persona, mascota u objeto
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="flex items-center gap-3 rounded-2xl border border-white/30 bg-white/15 px-5 py-4 text-left text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-amber-950">
                  <QrCode className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-base font-black">
                    Activar mi producto
                  </span>
                  <span className="mt-0.5 block text-sm text-violet-100">
                    Escaneá el QR del colgante o sticker
                  </span>
                </span>
              </button>
            </div>
          )}
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

      {!legalBlocked && <PushNotificationPanel push={push} />}

      {!loading && unreadCount > 0 && !legalBlocked && (
        <AlertBanner unreadCount={unreadCount} latestLogId={latestUnread?.id} />
      )}

      {!loading && activatedProfile && !legalBlocked && (
        <div className="flex items-start gap-4 rounded-2xl border border-green-200/80 bg-gradient-to-r from-green-50 to-emerald-50 p-5 shadow-lg shadow-green-500/10">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white shadow-md">
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-bold text-green-900">QR activado correctamente</p>
            <p className="mt-1 text-sm leading-relaxed text-green-800">
              El perfil <strong>{activatedProfile.beneficiary_name}</strong> está
              listo.
              {activatedProfile.profile_type === "pet"
                ? " Abrilo desde Mascotas para ver la libreta sanitaria."
                : ' Descargá el PNG con "Ver QR".'}
            </p>
          </div>
        </div>
      )}

      {scannerOpen && (
        <QrActivationScanner onClose={() => setScannerOpen(false)} />
      )}

      {!loading && !legalBlocked && (
        <ObjectSavedLocationsBanner profiles={profiles} />
      )}

      {!loading && !hasAnyProfiles && !legalBlocked && (
        <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-neutral-900">
            Creá tu primer perfil QR
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Plan gratis: 1 perfil para persona, mascota u objeto. ¿Necesitás más?{" "}
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
        </div>
      )}

      {hasAnyProfiles && atProfileLimit && !legalBlocked && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-red-800">
              Llegaste al límite de perfiles de tu plan. Mejorá tu plan para
              crear más perfiles.
            </p>
          </div>
          <Link
            href="/contacto"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            Contactanos
          </Link>
        </div>
      )}

      {hasAnyProfiles && !atProfileLimit && !legalBlocked && (
        <div>
          <Button
            type="button"
            onClick={handleCreateProfile}
            className="w-full gap-2 sm:w-auto"
            size="lg"
          >
            <Plus className="h-5 w-5" aria-hidden />
            Crear perfil QR nuevo
          </Button>
        </div>
      )}

      {hasAnyProfiles &&
        orderedSections.map((sectionType) => {
        const meta = sectionMeta[sectionType];
        const sectionProfiles = profilesByType[sectionType];

        return (
          <DashboardSection
            key={sectionType}
            id={meta.id}
            icon={meta.icon}
            title={meta.title}
            description={meta.description}
            disabled={legalBlocked}
          >
            {loading ? (
              <div className="space-y-3">
                <div className="h-32 animate-pulse rounded-2xl bg-violet-50" />
              </div>
            ) : sectionProfiles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 sm:p-6">
                <h3 className="font-bold text-neutral-900">{meta.emptyTitle}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {meta.emptyBody}
                </p>
              </div>
            ) : sectionType === "pet" ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {sectionProfiles.map((profile) => (
                  <PetCard
                    key={profile.id}
                    profile={profile}
                    onRefresh={loadData}
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {sectionProfiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onRefresh={loadData}
                    defaultShowQr={profile.slug === highlightedSlug}
                  />
                ))}
              </div>
            )}
          </DashboardSection>
        );
      })}

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
