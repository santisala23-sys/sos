"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import type { QrProfile, ScanLogWithProfile } from "@/types/database";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
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
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
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
  const push = usePushNotifications();

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
    const params = new URLSearchParams(window.location.search);
    const shouldScan =
      params.get("escanear") === "1" ||
      window.location.hash === "#activar-producto";
    if (shouldScan) {
      setScannerOpen(true);
      if (params.get("escanear") === "1") {
        params.delete("escanear");
        const nextQuery = params.toString();
        const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
        window.history.replaceState(null, "", nextUrl);
      }
    }
  }, []);

  useEffect(() => {
    if (window.location.hash === "#perfiles") {
      window.history.replaceState(null, "", "/dashboard");
    }
  }, []);

  const latestUnread = logs.find((l) => !l.read_at);
  const legalBlocked = legalStatus?.needsAcceptance ?? false;

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
                ? " Abrilo desde tus perfiles para ver la libreta sanitaria."
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

      <section aria-labelledby="profiles-heading">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              id="profiles-heading"
              className="text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl"
            >
              Mis perfiles
            </h1>
            <p className="mt-1 text-sm text-neutral-600 sm:text-base">
              Todos tus QRs activos en un solo lugar.
            </p>
          </div>
          {!legalBlocked && (
            <Button
              type="button"
              size="lg"
              className="gap-2 self-start sm:self-auto"
              onClick={() => setScannerOpen(true)}
            >
              <QrCode className="h-5 w-5" aria-hidden />
              Escanear QR
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-48 animate-pulse rounded-2xl bg-violet-50" />
            <div className="h-48 animate-pulse rounded-2xl bg-violet-50" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center sm:p-10">
            <h2 className="text-lg font-bold text-neutral-900">
              Todavía no tenés perfiles activos
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-600">
              Escaneá el QR del colgante, chapita o sticker que te entregaron para
              vincularlo a tu cuenta.
            </p>
            {!legalBlocked && (
              <Button
                type="button"
                size="lg"
                className="mt-5 gap-2"
                onClick={() => setScannerOpen(true)}
              >
                <QrCode className="h-5 w-5" aria-hidden />
                Escanear QR del producto
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {profiles.map((profile) =>
              profile.profile_type === "pet" ? (
                <PetCard
                  key={profile.id}
                  profile={profile}
                  onRefresh={loadData}
                />
              ) : (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onRefresh={loadData}
                  defaultShowQr={profile.slug === highlightedSlug}
                />
              ),
            )}
          </div>
        )}
      </section>

      {!legalBlocked && <PushDevicesSection push={push} />}
    </main>
  );
}
