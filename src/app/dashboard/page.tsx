"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { QrProfileForm } from "@/components/dashboard/QrProfileForm";
import { QrProfileList } from "@/components/dashboard/QrProfileList";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<QrProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfiles = useCallback(async () => {
    const res = await fetch("/api/qr-profiles");
    if (res.ok) {
      const data = await res.json();
      setProfiles(data.profiles ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

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

      <main className="mx-auto max-w-3xl px-4 py-8">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-neutral-900">
            Nuevo perfil QR
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Completá los datos de la persona y el contacto de emergencia.
          </p>
          <div className="mt-6">
            <QrProfileForm onSuccess={loadProfiles} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-neutral-900">
            Mis perfiles
          </h2>
          {loading ? (
            <p className="text-neutral-500">Cargando...</p>
          ) : (
            <QrProfileList profiles={profiles} onRefresh={loadProfiles} />
          )}
        </section>
      </main>
    </div>
  );
}
