"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, QrCode, X } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { QrCodeDisplay } from "@/components/dashboard/QrCodeDisplay";
import { Button } from "@/components/ui/Button";
import { PROFILE_TYPES } from "@/lib/profile-types";
import { cn } from "@/lib/utils/cn";

type ProfileCardProps = {
  profile: QrProfile;
  onRefresh: () => void;
  defaultShowQr?: boolean;
};

const actionClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200";

export function ProfileCard({ profile, onRefresh, defaultShowQr = false }: ProfileCardProps) {
  const [showQr, setShowQr] = useState(defaultShowQr);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const typeLabel =
    PROFILE_TYPES.find((t) => t.value === profile.profile_type)?.label ??
    "Persona";

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/qr-profiles/${profile.id}`, { method: "DELETE" });
    setDeleting(false);
    setConfirmDelete(false);
    onRefresh();
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-violet-100/80 bg-white shadow-lg shadow-violet-500/8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/15">
      <div className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-600" />

      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        aria-label="Eliminar perfil"
        className="absolute right-3 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 shadow-sm backdrop-blur-sm transition-colors hover:border-red-300 hover:bg-red-100 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 pr-10">
          {profile.avatar_b64 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:${profile.avatar_mime ?? "image/jpeg"};base64,${profile.avatar_b64}`}
              alt={profile.beneficiary_name}
              className="h-14 w-14 shrink-0 rounded-full border-2 border-violet-100 object-cover shadow-sm"
            />
          )}
          <div className="min-w-0 flex-1">
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
        </dl>

        <div className="mt-5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/dashboard/perfiles/${profile.id}`}
              className={cn(
                actionClass,
                "border-violet-100 bg-violet-50/60 text-violet-800 hover:bg-violet-100",
              )}
            >
              <Eye className="h-4 w-4" aria-hidden />
              Ver perfil
            </Link>
            <Link
              href={`/dashboard/perfiles/${profile.id}/editar?from=${encodeURIComponent("/dashboard#perfiles")}`}
              className={actionClass}
            >
              <Pencil className="h-4 w-4" aria-hidden />
              Editar perfil
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className={cn(actionClass, "w-full")}
          >
            <QrCode className="h-4 w-4" aria-hidden />
            {showQr ? "Ocultar QR" : "Ver QR"}
          </button>
        </div>
      </div>

      {showQr && (
        <div className="mt-auto border-t border-violet-100 bg-violet-50/30 px-5 py-5 sm:px-6">
          <QrCodeDisplay
            slug={profile.slug}
            beneficiaryName={profile.beneficiary_name}
          />
        </div>
      )}

      {confirmDelete && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar eliminación"
        >
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" aria-hidden />
              </div>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                aria-label="Cancelar"
                className="text-neutral-400 transition-colors hover:text-neutral-700"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <h4 className="mt-3 text-lg font-black text-neutral-900">
              ¿Estás seguro que querés eliminar este perfil?
            </h4>
            <p className="mt-1 text-sm text-neutral-600">
              Se eliminará <strong>{profile.beneficiary_name}</strong> y su QR
              dejará de funcionar. Esta acción no se puede deshacer.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                {deleting ? "Eliminando..." : "Eliminar perfil"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
