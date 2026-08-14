"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  Bell,
  CheckCircle2,
  PawPrint,
  Package,
  QrCode,
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
  PushDevicesSection,
  PushNotificationPanel,
  usePushNotifications,
} from "@/components/dashboard/PushNotificationSetup";
import { ObjectSavedLocationsBanner } from "@/components/dashboard/ObjectSavedLocationsBanner";
import { ProfileLimitModal } from "@/components/dashboard/ProfileLimitModal";
import { SectionAddButton } from "@/components/dashboard/SectionAddButton";
import type { ProfileType } from "@/lib/profile-types";
import { sortProfileSections } from "@/lib/dashboard/profile-section-order";

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
  const [limitModalOpen, setLimitModalOpen] = useState(false);

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

  const profileCounts: Record<ProfileType, number> = {
    person: personProfiles.length,
    object: objectProfiles.length,
    pet: petProfiles.length,
  };
  // Personas/Objetos: ocultar si vacíos. Mascotas siempre visible.
  const orderedSections = sortProfileSections(profileCounts).filter(
    (type) => type === "pet" || profileCounts[type] > 0,
  );

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

  const addProfileLabels: Record<ProfileType, string> = {
    person: "Agregar persona",
    object: "Agregar objeto",
    pet: "Agregar mascota",
  };

  function handleAddProfile(type: ProfileType) {
    if (legalBlocked) return;
    if (atProfileLimit) {
      setLimitModalOpen(true);
      return;
    }
    router.push(`/dashboard/perfiles/nuevo?tipo=${type}`);
  }

  const activatedProfile = highlightedSlug
    ? profiles.find((p) => p.slug === highlightedSlug)
    : null;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
        href="/dashboard/actividad"
        className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 shadow-sm transition hover:bg-violet-50 lg:hidden"
      >
        <Activity className="h-4 w-4" aria-hidden />
        Ir a actividad
        {!loading && unreadCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>

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

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-200">
                <QrCode className="h-4 w-4" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  QRs activos
                </span>
              </div>
              <p className="mt-2 text-2xl font-black">
                {loading
                  ? "—"
                  : (planStatus?.activeCount ?? activeProfilesCount ?? 0)}
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
                  Alertas
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
          </div>

          {!legalBlocked && (
            <div className="mt-6" id="activar-producto">
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/30 bg-white/15 px-5 py-4 text-left text-white backdrop-blur-sm transition hover:bg-white/25 sm:max-w-md"
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

      {!legalBlocked &&
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
              headerAction={
                !legalBlocked ? (
                  <SectionAddButton
                    atLimit={atProfileLimit}
                    label={addProfileLabels[sectionType]}
                    onClick={() => handleAddProfile(sectionType)}
                  />
                ) : undefined
              }
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

      <ProfileLimitModal
        open={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
      />

      {!legalBlocked && <PushDevicesSection push={push} />}
    </main>
  );
}
