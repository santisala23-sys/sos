"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { QrProfileForm } from "@/components/dashboard/QrProfileForm";

export default function EditProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<QrProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/qr-profiles/${params.id}`);
      if (!res.ok) {
        router.push("/dashboard#perfiles");
        return;
      }
      const data = await res.json();
      setProfile(data.profile ?? null);
      setLoading(false);
    }
    void load();
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          <p className="text-sm font-medium text-neutral-500">Cargando editor...</p>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <Link
          href={`/dashboard/perfiles/${profile.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver al perfil
        </Link>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-neutral-900">
          Editar perfil
        </h1>
        <p className="mt-1 text-neutral-600">{profile.beneficiary_name}</p>
      </div>

      <section className="rounded-3xl border border-violet-100 bg-white p-5 shadow-xl shadow-violet-500/10 sm:p-8">
        <QrProfileForm
          profile={profile}
          onSuccess={() => router.push(`/dashboard/perfiles/${profile.id}`)}
          onCancel={() => router.push(`/dashboard/perfiles/${profile.id}`)}
        />
      </section>
    </main>
  );
}
