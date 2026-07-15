import { Syringe } from "lucide-react";
import type { PetPreventiveItem } from "@/types/database";
import { formatVisitDate } from "@/lib/pet-medical";

type VetPreventiveReadOnlyProps = {
  items: PetPreventiveItem[];
};

function isOverdue(nextDue: string | null): boolean {
  if (!nextDue) return false;
  return nextDue < new Date().toISOString().slice(0, 10);
}

export function VetPreventiveReadOnly({ items }: VetPreventiveReadOnlyProps) {
  const vaccines = items.filter((i) => i.kind === "vaccine");
  const dewormings = items.filter((i) => i.kind === "deworming");

  if (items.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Sin vacunas ni desparasitaciones cargadas.
      </p>
    );
  }

  function group(title: string, list: PetPreventiveItem[]) {
    if (list.length === 0) return null;
    return (
      <div>
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-teal-700">
          <Syringe className="h-3.5 w-3.5" aria-hidden />
          {title}
        </p>
        <ul className="mt-2 space-y-2">
          {list.map((item) => {
            const overdue = isOverdue(item.next_due_at);
            return (
              <li
                key={item.id}
                className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2"
              >
                <p className="font-semibold text-neutral-900">{item.name}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {item.last_applied_at
                    ? `Última: ${formatVisitDate(item.last_applied_at)}`
                    : "Sin fecha de aplicación"}
                  {" · "}
                  {item.next_due_at ? (
                    <span
                      className={
                        overdue ? "font-semibold text-amber-700" : undefined
                      }
                    >
                      Próxima: {formatVisitDate(item.next_due_at)}
                      {overdue ? " (vencida)" : ""}
                    </span>
                  ) : (
                    "Sin próxima"
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {group("Vacunas", vaccines)}
      {group("Desparasitaciones", dewormings)}
    </div>
  );
}
