"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Plus, UserCircle2 } from "lucide-react";
import type { QrProfile, ScanLogWithProfile } from "@/types/database";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
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
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const latestUnread = logs.find((l) => !l.read_at);

  return (
    <div className="min-h-dvh bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <Link href="/" className="text-xl font-black text-blue-800">
              SOS
            </Link>
            <p className="text-sm text-neutral-500">Panel del tutor</p>
          </div>
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
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {!loading && unreadCount > 0 && (
          <AlertBanner
            unreadCount={unreadCount}
            latestLogId={latestUnread?.id}
          />
        )}

        <PushNotificationAlert push={push} />

        <section id="perfiles">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-neutral-500" aria-hidden />
              <h2 className="text-xl font-bold text-neutral-900">Mis perfiles</h2>
            </div>
            {!loading && profiles.length > 0 && (
              <Button
                type="button"
                size="sm"
                onClick={() => setShowAddForm((v) => !v)}
                className="gap-1"
              >
                <Plus className="h-4 w-4" aria-hidden />
                {showAddForm ? "Cancelar" : "Agregar perfil"}
              </Button>
            )}
          </div>

          {loading ? (
            <p className="text-neutral-500">Cargando...</p>
          ) : profiles.length === 0 ? (
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900">
                Creá tu primer perfil
              </h3>
              <p className="mt-1 text-sm text-neutral-600">
                Completá los datos para generar el QR de emergencia.
              </p>
              <div className="mt-6">
                <QrProfileForm
                  onSuccess={() => {
                    loadData();
                    setShowAddForm(false);
                  }}
                />
              </div>
            </section>
          ) : (
            <>
              {showAddForm && (
                <section className="mb-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-5">
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
                  />
                ))}
              </div>
            </>
          )}
        </section>

        <section id="actividad">
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
