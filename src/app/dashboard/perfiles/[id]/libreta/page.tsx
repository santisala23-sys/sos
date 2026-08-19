"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { PetMedicalHistory } from "@/components/dashboard/PetMedicalHistory";

export default function PetHealthBookPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<QrProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/qr-profiles/${params.id}`);
      if (!res.ok) {
        router.push("/dashboard#mascotas");
        return;
      }
      const data = await res.json();
      const loaded = data.profile as QrProfile | null;
      if (!loaded || loaded.profile_type !== "pet") {
        router.push(`/dashboard/perfiles/${params.id}`);
        return;
      }
      setProfile(loaded);
      setLoading(false);
    }
    void load();
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
          <p className="text-sm font-medium text-neutral-500">Cargando libreta...</p>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard#mascotas"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver a mascotas
        </Link>
        <Link
          href={`/dashboard/perfiles/${profile.id}/editar?from=${encodeURIComponent(`/dashboard/perfiles/${profile.id}/libreta`)}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-base font-semibold text-teal-900 transition-colors hover:bg-teal-100"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          Editar datos
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-xl shadow-teal-500/10">
        <div className="border-b border-teal-100 bg-gradient-to-br from-teal-600 to-emerald-800 px-6 py-8 text-white sm:px-8">
          <p className="text-sm font-semibold text-teal-100">Mascota</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">
            {profile.beneficiary_name}
          </h1>
          <p className="mt-2 text-sm text-teal-100/90">
            Libreta sanitaria — vacunas, visitas e indicaciones veterinarias.
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <PetMedicalHistory
            petId={profile.id}
            petName={profile.beneficiary_name}
            petBreed={profile.pet_breed ?? null}
            petBirthDate={profile.pet_birth_date ?? null}
            embedded
          />
        </div>
      </div>
    </main>
  );
}
