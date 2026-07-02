"use client";

import { useState } from "react";
import { Pencil, Trash2, QrCode, Smartphone } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { QrCodeDisplay } from "@/components/dashboard/QrCodeDisplay";
import { QrProfileForm } from "@/components/dashboard/QrProfileForm";
import { Button } from "@/components/ui/Button";
import { getSosOnlyUrl } from "@/lib/utils/slug";
import { PROFILE_TYPES } from "@/lib/profile-types";

type ProfileCardProps = {
  profile: QrProfile;
  onRefresh: () => void;
  defaultShowQr?: boolean;
};

export function ProfileCard({ profile, onRefresh, defaultShowQr = false }: ProfileCardProps) {
  const [showQr, setShowQr] = useState(defaultShowQr);
  const [editing, setEditing] = useState(false);
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
    <article className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-neutral-900">
              {profile.beneficiary_name}
            </h3>
            <span className="mt-1 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
              {typeLabel}
            </span>
            {!profile.is_active && (
              <span className="mt-1 inline-block rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600">
                Inactivo
              </span>
            )}
          </div>
        </div>

        <dl className="mt-3 space-y-1 text-sm text-neutral-600">
          <div>
            <dt className="sr-only">Contacto</dt>
            <dd>
              {profile.emergency_contact_name} · {profile.emergency_contact_phone}
            </dd>
          </div>
          {profile.secondary_contact_name && profile.secondary_contact_phone && (
            <div>
              <dt className="text-xs text-neutral-400">Secundario</dt>
              <dd>
                {profile.secondary_contact_name} · {profile.secondary_contact_phone}
              </dd>
            </div>
          )}
          <div className="text-xs text-neutral-400">/p/{profile.slug}</div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setShowQr(!showQr);
              if (!showQr) setEditing(false);
            }}
            className="gap-1"
          >
            <QrCode className="h-4 w-4" aria-hidden />
            {showQr ? "Ocultar QR" : "Ver QR"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditing(!editing);
              if (!editing) setShowQr(false);
            }}
            className="gap-1"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Editar perfil
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Eliminar
          </Button>
        </div>
      </div>

      {showQr && (
        <div className="border-t border-neutral-100 px-5 py-4">
          <QrCodeDisplay
            slug={profile.slug}
            beneficiaryName={profile.beneficiary_name}
          />
        </div>
      )}

      {editing && (
        <div className="border-t border-neutral-100 px-5 py-4">
          <QrProfileForm
            profile={profile}
            onSuccess={() => {
              setEditing(false);
              onRefresh();
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      <div className="mt-auto border-t border-amber-100 bg-amber-50/80 px-5 py-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
          <Smartphone className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Modo solo SOS
        </p>
        <a
          href={sosOnlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block truncate text-xs text-violet-700 underline"
        >
          {sosOnlyUrl}
        </a>
      </div>
    </article>
  );
}
