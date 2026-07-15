"use client";

import type { PreventiveKind } from "@/types/database";

type VisitCalendarUpdateProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  kind: PreventiveKind;
  onKindChange: (kind: PreventiveKind) => void;
  name: string;
  onNameChange: (name: string) => void;
  nextDue: string;
  onNextDueChange: (nextDue: string) => void;
  accent?: "violet" | "teal";
  inputClass: string;
};

export function VisitCalendarUpdate({
  enabled,
  onEnabledChange,
  kind,
  onKindChange,
  name,
  onNameChange,
  nextDue,
  onNextDueChange,
  accent = "violet",
  inputClass,
}: VisitCalendarUpdateProps) {
  const boxClass =
    accent === "teal"
      ? "rounded-2xl border border-teal-100 bg-teal-50/50 p-3"
      : "rounded-2xl border border-violet-100 bg-violet-50/60 p-3";
  const activeChip =
    accent === "teal"
      ? "bg-teal-700 text-white"
      : "bg-violet-700 text-white";

  return (
    <div className={boxClass}>
      <label className="flex items-start gap-2 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          className="mt-0.5"
        />
        <span>Actualizar calendario de vacunas / desparasitaciones</span>
      </label>
      {enabled && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["vaccine", "Vacuna"],
                ["deworming", "Desparasitación"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onKindChange(value)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  kind === value
                    ? activeChip
                    : "border border-neutral-300 bg-white text-neutral-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Nombre
            </label>
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className={inputClass}
              placeholder="Ej. Antirrábica"
              maxLength={200}
              required={enabled}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Próxima aplicación{" "}
              <span className="font-normal text-neutral-400">(opcional)</span>
            </label>
            <input
              type="date"
              value={nextDue}
              onChange={(e) => onNextDueChange(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      )}
    </div>
  );
}
