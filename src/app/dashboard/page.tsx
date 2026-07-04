"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, LogOut, Shield, UserCircle2 } from "lucide-react";
import type { QrProfile, ScanLogWithProfile } from "@/types/database";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { ActivateCodeInput } from "@/components/dashboard/ActivateCodeInput";
import { LegalAcceptanceBanner } from "@/components/dashboard/LegalAcceptanceBanner";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import {
  PushNotificationAlert,
  PushNotificationFooter,
  usePushNotifications,
} from "@/components/dashboard/PushNotificationSetup";
import { ScanLogsList } from "@/components/dashboard/ScanLogsList";
import { QrProfileForm } from "@/components/dashboard/QrProfileForm";
import { BrandLogo } from "@/components/shared/BrandLogo";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [legalStatus, setLegalStatus] = useState<{
    needsAcceptance: boolean;
    currentVersion: string;
    userVersion: string | null;
  } | null>(null);
  const [planStatus, setPlanStatus] = useState<{
    planName: string;
    maxProfiles: number;
    currentCount: number;
    canCreateMore: boolean;
  } | null>(null);
  const push = usePushNotifications();

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
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => setIsAdmin(Boolean(d.isAdmin)))
      .catch(() => setIsAdmin(false));
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const activatedSlug = params.get("activado");
    if (activatedSlug) setHighlightedSlug(activatedSlug);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const latestUnread = logs.find((l) => !l.read_at);
  const legalBlocked = legalStatus?.needsAcceptance ?? false;
  const atProfileLimit = planStatus != null && !planStatus.canCreateMore;
  const activatedProfile = highlightedSlug
    ? profiles.find((p) => p.slug === highlightedSlug)
    : null;

  return (
    <div className="min-h-dvh bg-[#faf9fc]">
      <header className="border-b border-neutral-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <BrandLogo />
            <p className="text-sm text-neutral-500">
              Panel del tutor
              {planStatus && (
                <span className="text-neutral-400">
                  {" "}
                  · {planStatus.currentCount}/{planStatus.maxProfiles} QR
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-50"
              >
                <Shield className="h-4 w-4" aria-hidden />
                Admin
              </Link>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
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
          <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden />
            <div>
              <p className="font-semibold text-green-900">QR activado correctamente</p>
              <p className="mt-1 text-sm text-green-800">
                El perfil <strong>{activatedProfile.beneficiary_name}</strong> está listo.
                Descargá el PNG con &quot;Ver QR&quot;.
              </p>
            </div>
          </div>
        )}

        <section id="perfiles" className={legalBlocked ? "pointer-events-none opacity-40" : undefined}>
          <div className="mb-4 flex items-center gap-2">
            <UserCircle2 className="h-5 w-5 text-neutral-500" aria-hidden />
            <h2 className="text-xl font-bold text-neutral-900">Mis perfiles</h2>
          </div>

          {loading ? (
            <p className="text-neutral-500">Cargando...</p>
          ) : profiles.length === 0 ? (
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900">Creá tu primer perfil QR</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Plan gratis: 1 perfil para persona, mascota u objeto. ¿Necesitás más?{" "}
                <Link href="/contacto" className="font-medium text-violet-700 hover:underline">
                  Contactanos
                </Link>
                .
              </p>
              <div className="mt-6">
                <QrProfileForm onSuccess={loadData} />
              </div>
              <details className="mt-6 rounded-xl border border-neutral-100 bg-neutral-50/80">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-neutral-700">
                  ¿Tenés un código en un colgante o producto?
                </summary>
                <div className="border-t border-neutral-100 px-4 py-4">
                  <ActivateCodeInput buttonLabel="Ir a activar" />
                </div>
              </details>
            </section>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onRefresh={loadData}
                    defaultShowQr={profile.slug === highlightedSlug}
                  />
                ))}
              </div>

              <details
                className="mt-4 rounded-xl border border-neutral-200 bg-white"
                open={showActivateCode}
                onToggle={(e) => setShowActivateCode((e.target as HTMLDetailsElement).open)}
              >
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-neutral-700">
                  Activar código de colgante o producto
                </summary>
                <div className="border-t border-neutral-100 px-4 py-4">
                  <ActivateCodeInput buttonLabel="Ir a activar" />
                </div>
              </details>

              <details
                className="mt-4 rounded-xl border border-neutral-200 bg-white"
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
                  className="cursor-pointer px-4 py-3 text-sm font-medium text-neutral-700"
                  onClick={(e) => {
                    if (atProfileLimit) {
                      e.preventDefault();
                      router.push("/pricing");
                    }
                  }}
                >
                  Crear perfil QR nuevo
                </summary>
                {!atProfileLimit && (
                  <div className="border-t border-neutral-100 px-4 py-4">
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
            </>
          )}
        </section>

        <section id="actividad" className={legalBlocked ? "pointer-events-none opacity-40" : undefined}>
          <h2 className="mb-4 text-xl font-bold text-neutral-900">Actividad reciente</h2>
          {loading ? (
            <p className="text-neutral-500">Cargando...</p>
          ) : (
            <ScanLogsList logs={logs} />
          )}
        </section>

        <PushNotificationFooter push={push} />
      </main>
    </div>
  );
}
