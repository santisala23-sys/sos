"use client";

import { useState } from "react";
import { ChevronDown, Loader2, Scale } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  describePetAge,
  formatPetBirthDate,
} from "@/lib/utils/pet-age";
import type { PetWeightEntry } from "@/types/database";

type PetClinicalProfileProps = {
  petId: string;
  breed: string | null;
  birthDate: string | null;
  weightEntries: PetWeightEntry[];
  onBreedBirthChange?: (data: {
    pet_breed: string | null;
    pet_birth_date: string | null;
  }) => void;
  onWeightEntryAdded?: (entry: PetWeightEntry) => void;
  readOnly?: boolean;
};

function formatWeightKg(kg: number): string {
  const rounded = Math.round(kg * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

function formatRecordedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PetClinicalProfile({
  petId,
  breed: initialBreed,
  birthDate: initialBirthDate,
  weightEntries,
  onBreedBirthChange,
  onWeightEntryAdded,
  readOnly = false,
}: PetClinicalProfileProps) {
  const [open, setOpen] = useState(true);
  const [breed, setBreed] = useState(initialBreed ?? "");
  const [birthDate, setBirthDate] = useState(initialBirthDate ?? "");
  const [savingFicha, setSavingFicha] = useState(false);
  const [fichaError, setFichaError] = useState<string | null>(null);
  const [fichaSaved, setFichaSaved] = useState(false);

  const [weightInput, setWeightInput] = useState("");
  const [weightNotes, setWeightNotes] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);
  const [weightError, setWeightError] = useState<string | null>(null);

  const latestWeight = weightEntries[0]?.weight_kg ?? null;
  const ageLabel = birthDate ? describePetAge(birthDate) : null;

  async function saveFicha(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    setSavingFicha(true);
    setFichaError(null);
    setFichaSaved(false);
    try {
      const res = await fetch(`/api/qr-profiles/${petId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet_breed: breed.trim() || null,
          pet_birth_date: birthDate || null,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFichaError(data.error ?? "No se pudo guardar");
        return;
      }
      onBreedBirthChange?.({
        pet_breed: breed.trim() || null,
        pet_birth_date: birthDate || null,
      });
      setFichaSaved(true);
      window.setTimeout(() => setFichaSaved(false), 2500);
    } catch {
      setFichaError("Error de conexión");
    } finally {
      setSavingFicha(false);
    }
  }

  async function addWeight(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    setSavingWeight(true);
    setWeightError(null);
    try {
      const res = await fetch(`/api/qr-profiles/${petId}/weight-entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight_kg: weightInput,
          notes: weightNotes,
        }),
      });
      const data = (await res.json()) as {
        entry?: PetWeightEntry;
        error?: string;
      };
      if (!res.ok || !data.entry) {
        setWeightError(data.error ?? "No se pudo registrar el peso");
        return;
      }
      onWeightEntryAdded?.(data.entry);
      setWeightInput("");
      setWeightNotes("");
    } catch {
      setWeightError("Error de conexión");
    } finally {
      setSavingWeight(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Scale className="h-4 w-4 text-violet-600" aria-hidden />
            <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-700">
              Ficha clínica
            </h3>
            {latestWeight != null && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                {formatWeightKg(latestWeight)} kg
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            Raza, edad y registro de peso (opcional).
          </p>
        </div>
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4" aria-hidden />
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-5 border-t border-neutral-200 pt-4">
          {readOnly ? (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-neutral-600">Raza</dt>
                <dd className="mt-0.5 text-neutral-800">
                  {breed.trim() || "—"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-neutral-600">Nacimiento</dt>
                <dd className="mt-0.5 text-neutral-800">
                  {birthDate ? formatPetBirthDate(birthDate) : "—"}
                  {ageLabel ? (
                    <span className="text-neutral-500"> · {ageLabel}</span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-neutral-600">Último peso</dt>
                <dd className="mt-0.5 text-neutral-800">
                  {latestWeight != null ? `${formatWeightKg(latestWeight)} kg` : "—"}
                </dd>
              </div>
            </dl>
          ) : (
            <form onSubmit={(e) => void saveFicha(e)} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="pet_breed" className="text-sm font-semibold text-neutral-700">
                    Raza{" "}
                    <span className="font-normal text-neutral-400">(opcional)</span>
                  </label>
                  <input
                    id="pet_breed"
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className={inputClass}
                    placeholder="Ej. Mestizo, Golden Retriever..."
                    maxLength={120}
                  />
                </div>
                <div>
                  <label
                    htmlFor="pet_birth_date"
                    className="text-sm font-semibold text-neutral-700"
                  >
                    Fecha de nacimiento{" "}
                    <span className="font-normal text-neutral-400">(opcional)</span>
                  </label>
                  <input
                    id="pet_birth_date"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={inputClass}
                  />
                  {ageLabel ? (
                    <p className="mt-1 text-xs text-neutral-500">Edad: {ageLabel}</p>
                  ) : null}
                </div>
              </div>
              {fichaError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {fichaError}
                </p>
              )}
              {fichaSaved && (
                <p className="text-sm font-medium text-emerald-700">Ficha guardada</p>
              )}
              <Button type="submit" variant="secondary" disabled={savingFicha} className="gap-2">
                {savingFicha ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Guardar ficha
              </Button>
            </form>
          )}

          {!readOnly && (
            <form
              onSubmit={(e) => void addWeight(e)}
              className="space-y-3 rounded-xl border border-violet-100 bg-violet-50/50 p-3"
            >
              <p className="text-sm font-semibold text-neutral-800">Registrar peso</p>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,8rem)_1fr]">
                <div>
                  <label htmlFor="weight_kg" className="text-xs font-semibold text-neutral-600">
                    Peso (kg)
                  </label>
                  <input
                    id="weight_kg"
                    type="text"
                    inputMode="decimal"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className={inputClass}
                    placeholder="Ej. 12.5"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="weight_notes" className="text-xs font-semibold text-neutral-600">
                    Notas{" "}
                    <span className="font-normal text-neutral-400">(opcional)</span>
                  </label>
                  <input
                    id="weight_notes"
                    type="text"
                    value={weightNotes}
                    onChange={(e) => setWeightNotes(e.target.value)}
                    className={inputClass}
                    placeholder="Ej. En casa, después de comer"
                    maxLength={500}
                  />
                </div>
              </div>
              {weightError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {weightError}
                </p>
              )}
              <Button type="submit" disabled={savingWeight} className="gap-2">
                {savingWeight ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Agregar peso
              </Button>
            </form>
          )}

          {weightEntries.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                Historial de peso
              </p>
              <ul className="mt-2 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
                {weightEntries.slice(0, 8).map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2.5 text-sm"
                  >
                    <span className="font-semibold text-neutral-900">
                      {formatWeightKg(entry.weight_kg)} kg
                    </span>
                    <span className="text-neutral-500">
                      {formatRecordedAt(entry.recorded_at)}
                      {entry.source === "vet" ? " · vet" : " · tutor"}
                      {entry.vet_name ? ` · ${entry.vet_name}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Resumen compacto para la cabecera de la vista veterinario. */
export function PetClinicalSummary({
  breed,
  birthDate,
  latestWeightKg,
}: {
  breed: string | null;
  birthDate: string | null;
  latestWeightKg: number | null;
}) {
  const ageLabel = birthDate ? describePetAge(birthDate) : null;
  const hasAny = breed?.trim() || birthDate || latestWeightKg != null;
  if (!hasAny) return null;

  return (
    <dl className="grid gap-2 border-b border-neutral-100 px-6 py-4 text-sm sm:grid-cols-3">
      {breed?.trim() ? (
        <div>
          <dt className="font-semibold text-neutral-600">Raza</dt>
          <dd className="mt-0.5 text-neutral-800">{breed}</dd>
        </div>
      ) : null}
      {birthDate ? (
        <div>
          <dt className="font-semibold text-neutral-600">Edad</dt>
          <dd className="mt-0.5 text-neutral-800">
            {ageLabel ?? formatPetBirthDate(birthDate)}
          </dd>
        </div>
      ) : null}
      {latestWeightKg != null ? (
        <div>
          <dt className="font-semibold text-neutral-600">Último peso</dt>
          <dd className="mt-0.5 text-neutral-800">
            {formatWeightKg(latestWeightKg)} kg
          </dd>
        </div>
      ) : null}
    </dl>
  );
}
