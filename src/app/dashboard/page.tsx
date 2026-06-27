"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import type { QrProfile, ScanLogWithProfile } from "@/types/database";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { DashboardQrHero } from "@/components/dashboard/DashboardQrHero";
import { ScanLogsList } from "@/components/dashboard/ScanLogsList";
import { QrProfileForm } from "@/components/dashboard/QrProfileForm";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<QrProfile[]>([]);
  const [logs, setLogs] = useState<ScanLogWithProfile[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

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

  const primaryProfile = profiles.find((p) => p.is_active) ?? profiles[0];
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

        {loading ? (
          <p className="text-neutral-500">Cargando...</p>
        ) : primaryProfile ? (
          <DashboardQrHero profile={primaryProfile} />
        ) : (
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-neutral-900">
              Creá tu primer perfil
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Completá los datos para generar el QR de emergencia.
            </p>
            <div className="mt-6">
              <QrProfileForm onSuccess={loadData} />
            </div>
          </section>
        )}

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
      </main>
    </div>
  );
}
