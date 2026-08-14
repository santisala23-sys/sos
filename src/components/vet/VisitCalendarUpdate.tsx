"use client";

import type { PetPreventiveItem, PreventiveKind } from "@/types/database";
import {
  formatVisitDate,
  PREVENTIVE_KINDS,
  PREVENTIVE_KIND_LABELS,
} from "@/lib/pet-medical";

const NEW_ITEM = "__new__";

type VisitCalendarUpdateProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  kind: PreventiveKind;
  onKindChange: (kind: PreventiveKind) => void;
  name: string;
  onNameChange: (name: string) => void;
  nextDue: string;
  onNextDueChange: (nextDue: string) => void;
  /** Si hay ítems con próxima, se pueden elegir para actualizar esa fila. */
  existingItems?: PetPreventiveItem[];
  selectedItemId?: string | null;
  onSelectedItemIdChange?: (id: string | null) => void;
  accent?: "violet" | "teal";
  inputClass: string;
};

function itemOptionLabel(item: PetPreventiveItem): string {
  const kindLabel = PREVENTIVE_KIND_LABELS[item.kind];
  const next = item.next_due_at
    ? `Próxima: ${formatVisitDate(item.next_due_at)}`
    : "Sin próxima";
  return `${item.name} (${kindLabel}) · ${next}`;
}

function namePlaceholder(kind: PreventiveKind): string {
  if (kind === "vaccine") return "Ej. Antirrábica";
  if (kind === "deworming") return "Ej. Desparasitación garrapatas";
  return "Ej. Control general, curación...";
}

export function VisitCalendarUpdate({
  enabled,
  onEnabledChange,
  kind,
  onKindChange,
  name,
  onNameChange,
  nextDue,
  onNextDueChange,
  existingItems = [],
  selectedItemId = null,
  onSelectedItemIdChange,
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

  const scheduledItems = existingItems.filter((item) => item.next_due_at);
  const editingExisting = Boolean(selectedItemId);
  const showPicker = scheduledItems.length > 0 && onSelectedItemIdChange;
  const nextLabel =
    kind === "checkup" ? "Fecha de la próxima cita" : "Próxima aplicación";

  function handleSelectChange(value: string) {
    if (!onSelectedItemIdChange) return;
    if (value === NEW_ITEM) {
      onSelectedItemIdChange(null);
      onNameChange("");
      onNextDueChange("");
      return;
    }
    const item = scheduledItems.find((row) => row.id === value);
    if (!item) return;
    onSelectedItemIdChange(item.id);
    onKindChange(item.kind);
    onNameChange(item.name);
    onNextDueChange("");
  }

  return (
    <div className={boxClass}>
      <label className="flex items-start gap-2 text-sm text-neutral-800">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Actualizar calendario (vacuna, desparasitación o próxima cita)
        </span>
      </label>
      {enabled && (
        <div className="mt-3 space-y-3">
          {showPicker && (
            <div>
              <label className="text-sm font-semibold text-neutral-700">
                ¿Cuál actualizás?
              </label>
              <select
                value={selectedItemId ?? NEW_ITEM}
                onChange={(e) => handleSelectChange(e.target.value)}
                className={inputClass}
              >
                {scheduledItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {itemOptionLabel(item)}
                  </option>
                ))}
                <option value={NEW_ITEM}>Agregar otra…</option>
              </select>
              {editingExisting && (
                <p className="mt-1.5 text-xs text-neutral-500">
                  Se marca como aplicada en la fecha de la visita y podés cargar
                  la próxima programada.
                </p>
              )}
            </div>
          )}

          {!editingExisting && (
            <div className="flex flex-wrap gap-2">
              {PREVENTIVE_KINDS.map(({ value, label }) => (
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
          )}

          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Nombre
            </label>
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className={inputClass}
              placeholder={namePlaceholder(kind)}
              maxLength={200}
              required={enabled}
              readOnly={editingExisting}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-neutral-700">
              {nextLabel}{" "}
              <span className="font-normal text-neutral-400">
                {kind === "checkup" ? "(recomendado)" : "(opcional)"}
              </span>
            </label>
            <input
              type="date"
              value={nextDue}
              onChange={(e) => onNextDueChange(e.target.value)}
              className={inputClass}
              required={enabled && kind === "checkup" && !editingExisting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
