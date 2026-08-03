"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, PawPrint, Pencil, Trash2, X } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type PetCardProps = {
  profile: QrProfile;
  onRefresh: () => void;
};

const actionClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200";

export function PetCard({ profile, onRefresh }: PetCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/qr-profiles/${profile.id}`, { method: "DELETE" });
    setDeleting(false);
    setConfirmDelete(false);
    onRefresh();
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-teal-100/80 bg-white shadow-lg shadow-teal-500/8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-500/15">
      <div className="h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />

      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        aria-label="Eliminar mascota"
        className="absolute right-3 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 shadow-sm backdrop-blur-sm transition-colors hover:border-red-300 hover:bg-red-100 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start gap-3 pr-10">
          {profile.avatar_b64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:${profile.avatar_mime ?? "image/jpeg"};base64,${profile.avatar_b64}`}
              alt={profile.beneficiary_name}
              className="h-14 w-14 shrink-0 rounded-2xl border-2 border-teal-100 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <PawPrint className="h-7 w-7" aria-hidden />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-neutral-900 sm:text-xl">
              {profile.beneficiary_name}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-800">
                Mascota
              </span>
              {!profile.is_active && (
                <span className="inline-flex rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                  Inactivo
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-neutral-500">
              Libreta sanitaria, vacunas y visitas veterinarias.
            </p>
          </div>
        </div>

        <div className="mt-5 grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
          <Link
            href={`/dashboard/perfiles/${profile.id}`}
            className={cn(
              actionClass,
              "border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100 sm:col-span-2",
            )}
          >
            <ClipboardList className="h-4 w-4" aria-hidden />
            Abrir libreta sanitaria
          </Link>
          <Link
            href={`/dashboard/perfiles/${profile.id}/editar?from=${encodeURIComponent("/dashboard#mascotas")}`}
            className={cn(actionClass, "sm:col-span-2")}
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Editar datos
          </Link>
        </div>
      </div>

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
              ¿Estás seguro que querés eliminar esta mascota?
            </h4>
            <p className="mt-1 text-sm text-neutral-600">
              Se eliminará <strong>{profile.beneficiary_name}</strong>, su QR y
              la libreta sanitaria. Esta acción no se puede deshacer.
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
                {deleting ? "Eliminando..." : "Eliminar mascota"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
