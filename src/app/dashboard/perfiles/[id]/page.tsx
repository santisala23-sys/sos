"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { PetMedicalHistory } from "@/components/dashboard/PetMedicalHistory";
import { PublicQrButton } from "@/components/dashboard/PublicQrButton";
import { PROFILE_TYPES } from "@/lib/profile-types";
import { getPublicProfileUrl } from "@/lib/utils/slug";
import { formatDateTime } from "@/lib/utils/format";

export default function ProfileDetailPage() {
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
          <p className="text-sm font-medium text-neutral-500">Cargando perfil...</p>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  const typeLabel =
    PROFILE_TYPES.find((t) => t.value === profile.profile_type)?.label ??
    "Persona";
  const publicUrl = getPublicProfileUrl(profile.slug);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={
            profile.profile_type === "pet"
              ? "/dashboard#mascotas"
              : "/dashboard#perfiles"
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {profile.profile_type === "pet"
            ? "Volver a mascotas"
            : "Volver a perfiles QR"}
        </Link>
        <Link
          href={`/dashboard/perfiles/${profile.id}/editar?from=${encodeURIComponent(`/dashboard/perfiles/${profile.id}`)}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-base font-semibold text-white transition-colors hover:from-violet-700 hover:to-indigo-700"
        >
          <Pencil className="h-4 w-4" aria-hidden />
          Editar perfil
        </Link>
      </div>

      <section className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xl shadow-violet-500/10">
        <div className="border-b border-violet-100 bg-gradient-to-br from-violet-600 to-indigo-800 px-6 py-8 text-white sm:px-8">
          <p className="text-sm font-semibold text-violet-200">{typeLabel}</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">
            {profile.beneficiary_name}
          </h1>
          <p className="mt-2 font-mono text-sm text-violet-100">/p/{profile.slug}</p>
          {!profile.is_active && (
            <span className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
              Perfil inactivo
            </span>
          )}
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
              Contacto de emergencia
            </h2>
            <p className="mt-2 text-lg font-semibold text-neutral-900">
              {profile.emergency_contact_name}
            </p>
            <p className="text-neutral-600">{profile.emergency_contact_phone}</p>
          </div>

          {profile.secondary_contact_name && profile.secondary_contact_phone && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
                Contacto secundario
              </h2>
              <p className="mt-2 font-semibold text-neutral-900">
                {profile.secondary_contact_name}
              </p>
              <p className="text-neutral-600">{profile.secondary_contact_phone}</p>
            </div>
          )}

          {profile.instructions?.trim() && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
                Instrucciones
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-neutral-700">
                {profile.instructions}
              </p>
            </div>
          )}

          {(profile.allergies || profile.blood_type || profile.medical_notes) && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-rose-700">
                Datos médicos
              </h2>
              <dl className="mt-3 space-y-2 text-sm text-neutral-800">
                {profile.blood_type && (
                  <div>
                    <dt className="font-semibold text-neutral-500">Grupo sanguíneo</dt>
                    <dd>{profile.blood_type}</dd>
                  </div>
                )}
                {profile.allergies?.trim() && (
                  <div>
                    <dt className="font-semibold text-neutral-500">Alergias</dt>
                    <dd className="whitespace-pre-wrap">{profile.allergies}</dd>
                  </div>
                )}
                {profile.medical_notes?.trim() && (
                  <div>
                    <dt className="font-semibold text-neutral-500">Notas médicas</dt>
                    <dd className="whitespace-pre-wrap">{profile.medical_notes}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {profile.clinical_pdf_filename && (
            <p className="text-sm text-neutral-600">
              Historial clínico:{" "}
              <span className="font-medium text-neutral-900">
                {profile.clinical_pdf_filename}
              </span>
              {profile.clinical_pdf_uploaded_at
                ? ` · ${formatDateTime(profile.clinical_pdf_uploaded_at)}`
                : null}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-neutral-100 px-4 py-2 text-base font-semibold text-neutral-900 transition-colors hover:bg-neutral-200"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              Ver perfil público
            </a>
            <PublicQrButton
              slug={profile.slug}
              beneficiaryName={profile.beneficiary_name}
              className="w-full"
            />
          </div>
        </div>
      </section>

      {profile.profile_type === "pet" && (
        <PetMedicalHistory
          petId={profile.id}
          petName={profile.beneficiary_name}
        />
      )}
    </main>
  );
}
