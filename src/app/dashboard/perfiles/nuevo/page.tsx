"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QrProfileForm } from "@/components/dashboard/QrProfileForm";

export default function NewProfilePage() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <Link
          href="/dashboard#perfiles"
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
          onSuccess={() => router.push("/dashboard#perfiles")}
          onCancel={() => router.push("/dashboard#perfiles")}
        />
      </section>
    </main>
  );
}
