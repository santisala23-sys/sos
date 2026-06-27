"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { QrProfileForm } from "@/components/dashboard/QrProfileForm";
import { QrProfileList } from "@/components/dashboard/QrProfileList";
import { Button } from "@/components/ui/Button";

export default function PerfilPage() {
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

  return (
    <div className="min-h-dvh bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <Link href="/dashboard" className="text-xl font-black text-blue-800">
              SOS
            </Link>
            <p className="text-sm text-neutral-500">Editar perfiles</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold">Agregar otro perfil</h1>
          <div className="mt-4">
            <QrProfileForm onSuccess={loadProfiles} />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Todos los perfiles</h2>
          {loading ? (
            <p className="text-neutral-500">Cargando...</p>
          ) : (
            <QrProfileList profiles={profiles} onRefresh={loadProfiles} />
          )}
        </section>

        <Link href="/dashboard">
          <Button type="button" variant="secondary" className="w-full">
            Volver al panel
          </Button>
        </Link>
      </main>
    </div>
  );
}
