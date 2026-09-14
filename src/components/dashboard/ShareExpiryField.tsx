"use client";

import { cn } from "@/lib/utils/cn";

export type ShareExpiryMode = "permanent" | "dated";

type ShareExpiryFieldProps = {
  mode: ShareExpiryMode;
  dateValue: string;
  onModeChange: (mode: ShareExpiryMode) => void;
  onDateChange: (value: string) => void;
  idPrefix: string;
};

export function ShareExpiryField({
  mode,
  dateValue,
  onModeChange,
  onDateChange,
  idPrefix,
}: ShareExpiryFieldProps) {
  const permanentId = `${idPrefix}-permanent`;
  const datedId = `${idPrefix}-dated`;

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-neutral-800">
        ¿Por cuánto tiempo tendrá acceso?
      </legend>

      <label
        htmlFor={permanentId}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition",
          mode === "permanent"
            ? "border-violet-300 bg-white shadow-sm"
            : "border-neutral-200 bg-white/70",
        )}
      >
        <input
          id={permanentId}
          type="radio"
          name={`${idPrefix}-expiry-mode`}
          checked={mode === "permanent"}
          onChange={() => onModeChange("permanent")}
          className="mt-1"
        />
        <span>
          <span className="block text-base font-bold text-neutral-900">
            Acceso permanente
          </span>
          <span className="mt-0.5 block text-sm text-neutral-600">
            Sin fecha de fin. Ideal si es co-tutor fijo (pareja, familiar, etc.).
          </span>
        </span>
      </label>

      <label
        htmlFor={datedId}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition",
          mode === "dated"
            ? "border-violet-300 bg-white shadow-sm"
            : "border-neutral-200 bg-white/70",
        )}
      >
        <input
          id={datedId}
          type="radio"
          name={`${idPrefix}-expiry-mode`}
          checked={mode === "dated"}
          onChange={() => onModeChange("dated")}
          className="mt-1"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold text-neutral-900">
            Hasta una fecha
          </span>
          <span className="mt-0.5 block text-sm text-neutral-600">
            Para vacaciones o encargos temporales. Elegí el último día de acceso.
          </span>
          {mode === "dated" && (
            <input
              id={`${idPrefix}-date`}
              type="date"
              value={dateValue}
              onChange={(e) => onDateChange(e.target.value)}
              className="mt-3 w-full max-w-xs rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base"
              aria-label="Último día de acceso"
            />
          )}
        </span>
      </label>
    </fieldset>
  );
}

export function expiryFromMode(
  mode: ShareExpiryMode,
  dateValue: string,
): string | null {
  if (mode === "permanent") return null;
  if (!dateValue) return null;
  return new Date(`${dateValue}T23:59:59`).toISOString();
}

export function modeFromExpiry(iso: string | null): ShareExpiryMode {
  return iso ? "dated" : "permanent";
}
