"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { QrCodeDisplay } from "@/components/dashboard/QrCodeDisplay";
import { Button } from "@/components/ui/Button";

type DashboardQrHeroProps = {
  profile: QrProfile;
};

export function DashboardQrHero({ profile }: DashboardQrHeroProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-500">Perfil activo</p>
          <h1 className="text-2xl font-black text-neutral-900">
            {profile.beneficiary_name}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Contacto: {profile.emergency_contact_name} ·{" "}
            {profile.emergency_contact_phone}
          </p>
        </div>
        <Link href="/dashboard/perfil">
          <Button type="button" variant="secondary" size="sm" className="gap-1">
            <Settings className="h-4 w-4" aria-hidden />
            Editar perfil
          </Button>
        </Link>
      </div>
      <div className="mt-6 flex justify-center">
        <QrCodeDisplay
          slug={profile.slug}
          beneficiaryName={profile.beneficiary_name}
        />
      </div>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Imprimí o compartí este QR. Al escanearlo se abre la ficha de emergencia
        y vas a recibir una alerta acá.
      </p>
    </section>
  );
}
