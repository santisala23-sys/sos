import { CalendarClock } from "lucide-react";
import type { PetPreventiveItem } from "@/types/database";
import {
  formatVisitDate,
  PREVENTIVE_KIND_LABELS,
} from "@/lib/pet-medical";

type ScheduledPreventiveBannerProps = {
  items: PetPreventiveItem[];
};

function isOverdue(nextDue: string): boolean {
  return nextDue < new Date().toISOString().slice(0, 10);
}

/** Destaca vacunas/desparasitaciones/citas con fecha próxima, debajo del QR. */
export function ScheduledPreventiveBanner({
  items,
}: ScheduledPreventiveBannerProps) {
  const scheduled = items
    .filter((item) => item.next_due_at)
    .sort(
      (a, b) =>
        String(a.next_due_at).localeCompare(String(b.next_due_at)) ||
        a.name.localeCompare(b.name),
    );

  if (scheduled.length === 0) return null;

  return (
    <section
      className="mt-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/70 p-4 shadow-sm shadow-amber-500/10"
      aria-label="Próximas programadas"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
          <CalendarClock className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-amber-950">Próximas</h3>
          <p className="mt-0.5 text-xs text-amber-800/90">
            Vacunas, desparasitaciones o citas con fecha programada.
          </p>
          <ul className="mt-3 space-y-2">
            {scheduled.map((item) => {
              const due = item.next_due_at!;
              const overdue = isOverdue(due);
              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-amber-100 bg-white/90 px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-neutral-900">{item.name}</p>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                      {PREVENTIVE_KIND_LABELS[item.kind]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-600">
                    {item.last_applied_at
                      ? `Aplicada: ${formatVisitDate(item.last_applied_at)}`
                      : "Sin fecha de aplicación"}
                    {" · "}
                    <span
                      className={
                        overdue
                          ? "font-semibold text-amber-700"
                          : "font-semibold text-neutral-800"
                      }
                    >
                      Próxima: {formatVisitDate(due)}
                      {overdue ? " (vencida)" : ""}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
