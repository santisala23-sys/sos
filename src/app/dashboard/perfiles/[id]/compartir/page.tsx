"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2, User, PawPrint, Package } from "lucide-react";
import type { ProfileType, QrProfile } from "@/types/database";
import { ProfileSharePanel } from "@/components/dashboard/ProfileSharePanel";
import { PROFILE_TYPES } from "@/lib/profile-types";

const TYPE_ICON: Record<ProfileType, typeof User> = {
  person: User,
  pet: PawPrint,
  object: Package,
};

export default function ProfileSharePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<QrProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/qr-profiles/${params.id}`);
      if (!res.ok) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json();
      if (data.access !== "owner") {
        router.push("/dashboard");
        return;
      }
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
          <p className="text-sm font-medium text-neutral-500">Cargando accesos...</p>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  const typeLabel =
    PROFILE_TYPES.find((item) => item.value === profile.profile_type)?.label ??
    "Perfil";
  const TypeIcon = TYPE_ICON[profile.profile_type];

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-3.5 py-2 text-sm font-semibold text-violet-700 shadow-sm transition-colors hover:bg-violet-50"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver al panel
      </Link>

      <section className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xl shadow-violet-500/10">
        <div className="relative flex items-center gap-4 bg-gradient-to-br from-violet-600 to-indigo-800 px-6 py-7 text-white sm:px-8">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
            <Share2 className="h-7 w-7" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-violet-200">
              <TypeIcon className="h-3.5 w-3.5" aria-hidden />
              Co-tutoría · {typeLabel}
            </p>
            <h1 className="mt-0.5 truncate text-2xl font-black tracking-tight sm:text-3xl">
              {profile.beneficiary_name}
            </h1>
            <p className="mt-1 text-sm text-violet-100/90">
              Compartí el perfil, revisá quién tiene acceso y editá permisos.
            </p>
          </div>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <ProfileSharePanel
            profileId={profile.id}
            profileName={profile.beneficiary_name}
            profileType={profile.profile_type}
          />
        </div>
      </section>
    </main>
  );
}
