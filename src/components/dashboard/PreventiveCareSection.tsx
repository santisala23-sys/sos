"use client";

import { useState } from "react";
import { ChevronDown, Loader2, Plus, Syringe, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatVisitDate, PREVENTIVE_KIND_LABELS } from "@/lib/pet-medical";
import type { PetPreventiveItem, PreventiveKind } from "@/types/database";

type PreventiveCareSectionProps = {
  petId: string;
  items: PetPreventiveItem[];
  onChange: (items: PetPreventiveItem[]) => void;
  /** Vista solo lectura (veterinario). */
  readOnly?: boolean;
  /** Endpoint base: tutor usa default; vet pasa path con token. */
  createUrl?: string;
};

function isOverdue(nextDue: string | null): boolean {
  if (!nextDue) return false;
  return nextDue < new Date().toISOString().slice(0, 10);
}

export function PreventiveCareSection({
  petId,
  items,
  onChange,
  readOnly = false,
  createUrl,
}: PreventiveCareSectionProps) {
  const [kind, setKind] = useState<PreventiveKind>("vaccine");
  const [formOpen, setFormOpen] = useState(false);
  const [vaccinesOpen, setVaccinesOpen] = useState(false);
  const [dewormingsOpen, setDewormingsOpen] = useState(false);
  const [checkupsOpen, setCheckupsOpen] = useState(false);
  const [name, setName] = useState("");
  const [lastApplied, setLastApplied] = useState("");
  const [nextDue, setNextDue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const vaccines = items.filter((i) => i.kind === "vaccine");
  const dewormings = items.filter((i) => i.kind === "deworming");
  const checkups = items.filter((i) => i.kind === "checkup");
  const postUrl = createUrl ?? `/api/qr-profiles/${petId}/preventive`;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name,
          last_applied_at: lastApplied || null,
          next_due_at: nextDue || null,
        }),
      });
      const data = (await res.json()) as {
        item?: PetPreventiveItem;
        error?: string;
      };
      if (!res.ok || !data.item) {
        setError(data.error ?? "No se pudo guardar");
        return;
      }
      onChange([...items, data.item]);
      setName("");
      setLastApplied("");
      setNextDue("");
      setFormOpen(false);
      if (kind === "vaccine") setVaccinesOpen(true);
      else if (kind === "deworming") setDewormingsOpen(true);
      else setCheckupsOpen(true);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(itemId: string) {
    if (!window.confirm("¿Eliminar este registro?")) return;
    setDeletingId(itemId);
    try {
      const res = await fetch(
        `/api/qr-profiles/${petId}/preventive/${itemId}`,
        { method: "DELETE" },
      );
      if (!res.ok) return;
      onChange(items.filter((i) => i.id !== itemId));
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";

  function renderGroup(
    title: string,
    list: PetPreventiveItem[],
    k: PreventiveKind,
    open: boolean,
    onToggle: () => void,
  ) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
          >
            <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
              <Syringe className="h-4 w-4 shrink-0 text-violet-600" aria-hidden />
              {title}
              {list.length > 0 && (
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                  {list.length}
                </span>
              )}
            </h3>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            >
              <ChevronDown className="h-4 w-4" aria-hidden />
            </span>
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={() => {
                setKind(k);
                setFormOpen(true);
                if (k === "vaccine") setVaccinesOpen(true);
                else if (k === "deworming") setDewormingsOpen(true);
                else setCheckupsOpen(true);
              }}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-50"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Agregar
            </button>
          )}
        </div>

        {open &&
          (list.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500">Sin registros todavía.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {list.map((item) => {
                const overdue = isOverdue(item.next_due_at);
                return (
                  <li
                    key={item.id}
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-900">{item.name}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {item.last_applied_at
                            ? `Aplicada: ${formatVisitDate(item.last_applied_at)}`
                            : "Sin fecha de aplicación"}
                          {" · "}
                          {item.next_due_at ? (
                            <span
                              className={
                                overdue
                                  ? "font-semibold text-amber-700"
                                  : "text-neutral-600"
                              }
                            >
                              Próxima: {formatVisitDate(item.next_due_at)}
                              {overdue ? " (vencida)" : ""}
                            </span>
                          ) : (
                            "Sin próxima fecha"
                          )}
                        </p>
                      </div>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => void onDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="rounded p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Eliminar ${item.name}`}
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ))}

        {!open && list.length > 0 && (
          <p className="mt-2 text-xs text-neutral-500">
            Tocá para ver {list.length} registro{list.length === 1 ? "" : "s"}.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      {renderGroup(
        "Vacunas",
        vaccines,
        "vaccine",
        vaccinesOpen,
        () => setVaccinesOpen((v) => !v),
      )}
      {renderGroup(
        "Desparasitaciones",
        dewormings,
        "deworming",
        dewormingsOpen,
        () => setDewormingsOpen((v) => !v),
      )}
      {renderGroup(
        "Citas / controles",
        checkups,
        "checkup",
        checkupsOpen,
        () => setCheckupsOpen((v) => !v),
      )}

      {!readOnly && formOpen && (
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="space-y-3 rounded-2xl border border-violet-100 bg-violet-50/50 p-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-neutral-900">
              Nueva {PREVENTIVE_KIND_LABELS[kind].toLowerCase()}
            </h4>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="text-sm font-semibold text-neutral-500"
            >
              Cancelar
            </button>
          </div>
          <div>
            <label className="text-sm font-semibold text-neutral-700">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder={
                kind === "vaccine"
                  ? "Ej. Antirrábica, Séxtuple..."
                  : kind === "deworming"
                    ? "Ej. Drontal, desparasitación garrapatas..."
                    : "Ej. Control general, curación..."
              }
              required
              maxLength={200}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-neutral-700">
                {kind === "checkup" ? "Fecha de la cita" : "Fecha aplicada"}
              </label>
              <input
                type="date"
                value={lastApplied}
                onChange={(e) => setLastApplied(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-700">
                {kind === "checkup" ? "Próxima cita" : "Próxima aplicación"}
              </label>
              <input
                type="date"
                value={nextDue}
                onChange={(e) => setNextDue(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Guardar
          </Button>
        </form>
      )}
    </div>
  );
}
