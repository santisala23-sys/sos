"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, QrCode, Smartphone } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { QrCodeDisplay } from "@/components/dashboard/QrCodeDisplay";
import { Button } from "@/components/ui/Button";
import { getSosOnlyUrl } from "@/lib/utils/slug";
import { PROFILE_TYPES } from "@/lib/profile-types";
import { cn } from "@/lib/utils/cn";

type ProfileCardProps = {
  profile: QrProfile;
  onRefresh: () => void;
  defaultShowQr?: boolean;
};

const secondarySmClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200";

export function ProfileCard({ profile, onRefresh, defaultShowQr = false }: ProfileCardProps) {
  const [showQr, setShowQr] = useState(defaultShowQr);
  const sosOnlyUrl = getSosOnlyUrl(profile.slug);
  const typeLabel =
    PROFILE_TYPES.find((t) => t.value === profile.profile_type)?.label ??
    "Persona";

  async function handleDelete() {
    if (!confirm("¿Eliminar este perfil QR? Esta acción no se puede deshacer.")) {
      return;
    }
    await fetch(`/api/qr-profiles/${profile.id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-violet-100/80 bg-white shadow-lg shadow-violet-500/8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/15">
      <div className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-600" />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-neutral-900 sm:text-xl">
              {profile.beneficiary_name}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">
                {typeLabel}
              </span>
              {!profile.is_active && (
                <span className="inline-flex rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                  Inactivo
                </span>
              )}
            </div>
          </div>
        </div>

        <dl className="mt-4 space-y-2 rounded-xl bg-neutral-50/80 px-4 py-3 text-sm text-neutral-600">
          <div>
            <dt className="sr-only">Contacto</dt>
            <dd className="font-medium text-neutral-800">
              {profile.emergency_contact_name}
            </dd>
            <dd>{profile.emergency_contact_phone}</dd>
          </div>
          {profile.secondary_contact_name && profile.secondary_contact_phone && (
            <div className="border-t border-neutral-200/80 pt-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Secundario
              </dt>
              <dd className="mt-0.5">
                {profile.secondary_contact_name} · {profile.secondary_contact_phone}
              </dd>
            </div>
          )}
          <div className="border-t border-neutral-200/80 pt-2 font-mono text-xs text-violet-600">
            /p/{profile.slug}
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/dashboard/perfiles/${profile.id}`}
            className={cn(
              secondarySmClass,
              "border-violet-100 bg-violet-50/50 hover:bg-violet-100",
            )}
          >
            <Eye className="h-4 w-4" aria-hidden />
            Ver perfil
          </Link>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowQr(!showQr)}
            className="gap-1.5"
          >
            <QrCode className="h-4 w-4" aria-hidden />
            {showQr ? "Ocultar QR" : "Ver QR"}
          </Button>
          <Link
            href={`/dashboard/perfiles/${profile.id}/editar`}
            className={secondarySmClass}
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Editar
          </Link>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            className="gap-1.5"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Eliminar
          </Button>
        </div>
      </div>

      {showQr && (
        <div className="border-t border-violet-100 bg-violet-50/30 px-5 py-5 sm:px-6">
          <QrCodeDisplay
            slug={profile.slug}
            beneficiaryName={profile.beneficiary_name}
          />
        </div>
      )}

      <div className="mt-auto border-t border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50/80 px-5 py-4 sm:px-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-900">
          <Smartphone className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Modo solo SOS
        </p>
        <a
          href={sosOnlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 block truncate text-sm font-medium text-violet-700 underline-offset-2 hover:underline"
        >
          {sosOnlyUrl}
        </a>
      </div>
    </article>
  );
}
