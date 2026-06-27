"use client";

import Link from "next/link";
import { Settings, Smartphone } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { QrCodeDisplay } from "@/components/dashboard/QrCodeDisplay";
import { PushNotificationSetup } from "@/components/dashboard/PushNotificationSetup";
import { Button } from "@/components/ui/Button";
import { getSosOnlyUrl } from "@/lib/utils/slug";

type DashboardQrHeroProps = {
  profile: QrProfile;
};

export function DashboardQrHero({ profile }: DashboardQrHeroProps) {
  const sosOnlyUrl = getSosOnlyUrl(profile.slug);

  return (
    <div className="space-y-4">
      <PushNotificationSetup />

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
            {profile.secondary_contact_name && profile.secondary_contact_phone && (
              <p className="text-sm text-neutral-500">
                Secundario: {profile.secondary_contact_name} ·{" "}
                {profile.secondary_contact_phone}
              </p>
            )}
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
          Imprimí o compartí este QR. Al escanearlo se abre la ficha de emergencia.
        </p>

        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-amber-900">Modo solo SOS</p>
              <p className="mt-1 text-sm text-amber-800/90">
                Guardá este enlace en el celular de {profile.beneficiary_name} (pantalla
                de inicio). Solo muestra el botón de ayuda, sin QR.
              </p>
              <a
                href={sosOnlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block truncate text-sm font-medium text-blue-700 underline"
              >
                {sosOnlyUrl}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
