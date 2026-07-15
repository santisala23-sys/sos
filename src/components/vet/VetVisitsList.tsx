import { ClipboardList, ShieldCheck } from "lucide-react";
import type { PetVetVisit } from "@/types/database";
import { formatVisitDate, visitTagLabel } from "@/lib/pet-medical";
import { formatDateTime } from "@/lib/utils/format";

type VetVisitsListProps = {
  visits: PetVetVisit[];
  emptyLabel?: string;
};

export function VetVisitsList({
  visits,
  emptyLabel = "Sin visitas registradas todavía.",
}: VetVisitsListProps) {
  if (visits.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {visits.map((visit) => (
        <li
          key={visit.id}
          className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-teal-700">
                Visita
              </p>
              <time className="mt-0.5 block text-base font-semibold text-neutral-900">
                {formatVisitDate(visit.visit_date)}
              </time>
            </div>
            {visit.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {visit.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800"
                  >
                    {visitTagLabel(tag)}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              Qué se hizo
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-800">
              {visit.summary}
            </p>
          </div>

          {visit.indications?.trim() ? (
            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Indicaciones
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-amber-950">
                {visit.indications}
              </p>
            </div>
          ) : null}

          {visit.verified_by_vet ? (
            <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 text-xs font-medium text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Verificado por veterinario
              {visit.vet_name
                ? ` · ${visit.vet_name}${
                    visit.vet_license ? ` (Mat. ${visit.vet_license})` : ""
                  }`
                : ""}
              <span className="text-neutral-400">
                · {formatDateTime(visit.created_at)}
              </span>
            </p>
          ) : (
            <p className="mt-2 text-xs text-neutral-500">
              Cargado por el tutor
              {visit.vet_name ? ` · Ref. ${visit.vet_name}` : ""}
              <span className="text-neutral-400">
                {" "}
                · {formatDateTime(visit.created_at)}
              </span>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
