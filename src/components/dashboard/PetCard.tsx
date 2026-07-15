"use client";

import Link from "next/link";
import { ClipboardList, PawPrint, Pencil } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { cn } from "@/lib/utils/cn";

type PetCardProps = {
  profile: QrProfile;
};

const actionClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200";

export function PetCard({ profile }: PetCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-teal-100/80 bg-white shadow-lg shadow-teal-500/8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-500/15">
      <div className="h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start gap-3">
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
            className={actionClass}
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Editar datos
          </Link>
        </div>
      </div>
    </article>
  );
}
