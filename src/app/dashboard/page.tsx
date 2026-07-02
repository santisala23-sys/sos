"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, LogOut, Package, Plus, Shield, UserCircle2 } from "lucide-react";
import type { QrProfile, ScanLogWithProfile } from "@/types/database";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { ActivateCodeInput } from "@/components/dashboard/ActivateCodeInput";
import { LegalAcceptanceBanner } from "@/components/dashboard/LegalAcceptanceBanner";
import { ProfileOnboardingChoice } from "@/components/dashboard/ProfileOnboardingChoice";
import { RequestMoreProfilesCard } from "@/components/billing/RequestMoreProfilesCard";
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
  const [showActivateForm, setShowActivateForm] = useState(false);
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);
  const [openActivarOnboarding, setOpenActivarOnboarding] = useState(false);
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
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
        if (d?.email) setUserEmail(d.email);
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
    if (activatedSlug) {
      setHighlightedSlug(activatedSlug);
    }
    if (params.get("activar") === "1" || window.location.hash === "#activar") {
      setShowActivateForm(true);
      setOpenActivarOnboarding(true);
    }
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
          <AlertBanner
            unreadCount={unreadCount}
            latestLogId={latestUnread?.id}
          />
        )}

        <PushNotificationAlert push={push} />

        {!loading && activatedProfile && !legalBlocked && (
          <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden />
            <div>
              <p className="font-semibold text-green-900">QR activado correctamente</p>
              <p className="mt-1 text-sm text-green-800">
                El perfil <strong>{activatedProfile.beneficiary_name}</strong> ya está
                listo. Podés descargar el PNG abajo en &quot;Ver QR&quot;.
              </p>
            </div>
          </div>
        )}

        {!loading && atProfileLimit && !legalBlocked && (
          <RequestMoreProfilesCard
            email={userEmail ?? undefined}
            profileCount={planStatus?.currentCount}
          />
        )}

        <section id="perfiles" className={legalBlocked ? "pointer-events-none opacity-40" : undefined}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-neutral-500" aria-hidden />
              <h2 className="text-xl font-bold text-neutral-900">Mis perfiles</h2>
            </div>
            {!loading && profiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowActivateForm((v) => !v);
                    if (!showActivateForm) setShowAddForm(false);
                  }}
                  className="gap-1"
                  id="activar"
                >
                  <Package className="h-4 w-4" aria-hidden />
                  {showActivateForm ? "Cancelar" : "Activar código"}
                </Button>
                {planStatus?.canCreateMore && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setShowAddForm((v) => !v);
                      if (!showAddForm) setShowActivateForm(false);
                    }}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    {showAddForm ? "Cancelar" : "Agregar perfil"}
                  </Button>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <p className="text-neutral-500">Cargando...</p>
          ) : profiles.length === 0 ? (
            <ProfileOnboardingChoice
              onCreateSuccess={loadData}
              initialMode={openActivarOnboarding ? "activate" : "choose"}
            />
          ) : (
            <>
              {showActivateForm && (
                <section className="mb-4 rounded-2xl border border-violet-200 bg-violet-50/50 p-5">
                  <h3 className="font-semibold text-neutral-900">
                    Activar colgante o código
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    Ingresá el código impreso en la etiqueta, colgante o sticker.
                  </p>
                  <div className="mt-4">
                    <ActivateCodeInput buttonLabel="Ir a activar" />
                  </div>
                </section>
              )}

              {showAddForm && (
                <section className="mb-4 rounded-2xl border border-violet-200 bg-violet-50/50 p-5">
                  <h3 className="mb-4 font-semibold text-neutral-900">
                    Nuevo perfil QR
                  </h3>
                  <QrProfileForm
                    onSuccess={() => {
                      loadData();
                      setShowAddForm(false);
                    }}
                    onCancel={() => setShowAddForm(false)}
                  />
                </section>
              )}

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
            </>
          )}
        </section>

        <section id="actividad" className={legalBlocked ? "pointer-events-none opacity-40" : undefined}>
          <h2 className="mb-4 text-xl font-bold text-neutral-900">
            Actividad reciente
          </h2>
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
