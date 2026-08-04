"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QrProfileForm } from "@/components/dashboard/QrProfileForm";
import type { ProfileType } from "@/lib/profile-types";

const VALID_TYPES = new Set<ProfileType>(["person", "object", "pet"]);

const SECTION_HASH: Record<ProfileType, string> = {
  person: "personas",
  object: "objetos",
  pet: "mascotas",
};

function parseProfileType(value: string | null): ProfileType {
  if (value && VALID_TYPES.has(value as ProfileType)) {
    return value as ProfileType;
  }
  return "person";
}

function NewProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileType = parseProfileType(searchParams.get("tipo"));
  const backHash = SECTION_HASH[profileType];

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <Link
          href={`/dashboard#${backHash}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver a mis perfiles
        </Link>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-neutral-900">
          Crear perfil QR
        </h1>
        <p className="mt-1 text-neutral-600">
          Completá los datos de emergencia que verá quien escanee el código.
        </p>
      </div>

      <section className="rounded-3xl border border-violet-100 bg-white p-5 shadow-xl shadow-violet-500/10 sm:p-8">
        <QrProfileForm
          defaultProfileType={profileType}
          onSuccess={() => router.push(`/dashboard#${backHash}`)}
          onCancel={() => router.push(`/dashboard#${backHash}`)}
        />
      </section>
    </main>
  );
}

export default function NewProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
        </main>
      }
    >
      <NewProfileContent />
    </Suspense>
  );
}
