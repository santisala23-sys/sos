"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  VisitFilePicker,
  type PendingVisitFile,
} from "@/components/vet/VisitFilePicker";
import { VisitCalendarUpdate } from "@/components/vet/VisitCalendarUpdate";
import { VISIT_TAGS } from "@/lib/pet-medical";
import type {
  PetPreventiveItem,
  PreventiveKind,
  VisitTag,
} from "@/types/database";

type VetVisitFormProps = {
  token: string;
  preventiveItems?: PetPreventiveItem[];
  onPreventiveAdded?: () => void;
  /** Si false, el título lo pone el contenedor (p. ej. sección desplegable). */
  showHeading?: boolean;
};

export function VetVisitForm({
  token,
  preventiveItems = [],
  onPreventiveAdded,
  showHeading = true,
}: VetVisitFormProps) {
  const router = useRouter();
  const [visitDate, setVisitDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [summary, setSummary] = useState("");
  const [indications, setIndications] = useState("");
  const [tags, setTags] = useState<VisitTag[]>(["checkup"]);
  const [vetName, setVetName] = useState("");
  const [vetLicense, setVetLicense] = useState("");
  const [files, setFiles] = useState<PendingVisitFile[]>([]);
  const [updateCalendar, setUpdateCalendar] = useState(false);
  const [preventiveKind, setPreventiveKind] = useState<PreventiveKind>("vaccine");
  const [preventiveName, setPreventiveName] = useState("");
  const [preventiveNextDue, setPreventiveNextDue] = useState("");
  const [selectedPreventiveId, setSelectedPreventiveId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const scheduledItems = preventiveItems.filter((item) => item.next_due_at);

  function toggleTag(tag: VisitTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function handleCalendarEnabled(enabled: boolean) {
    setUpdateCalendar(enabled);
    if (!enabled) {
      setSelectedPreventiveId(null);
      setPreventiveName("");
      setPreventiveNextDue("");
      setPreventiveKind("vaccine");
      return;
    }
    if (scheduledItems.length > 0) {
      const first = scheduledItems[0]!;
      setSelectedPreventiveId(first.id);
      setPreventiveKind(first.kind);
      setPreventiveName(first.name);
      setPreventiveNextDue("");
    } else {
      setSelectedPreventiveId(null);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/vet-view/${token}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visit_date: visitDate,
          summary,
          indications,
          tags,
          vet_name: vetName,
          vet_license: vetLicense,
          attachments: files,
        }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar la visita");
        return;
      }

      if (updateCalendar && preventiveName.trim()) {
        const prevRes = await fetch(`/api/vet-view/${token}/preventive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(selectedPreventiveId ? { id: selectedPreventiveId } : {}),
            kind: preventiveKind,
            name: preventiveName.trim(),
            last_applied_at: visitDate,
            next_due_at: preventiveNextDue || null,
          }),
        });
        if (prevRes.ok) onPreventiveAdded?.();
      }

      setSuccess(true);
      setSummary("");
      setIndications("");
      setTags(["checkup"]);
      setFiles([]);
      setUpdateCalendar(false);
      setPreventiveName("");
      setPreventiveNextDue("");
      setSelectedPreventiveId(null);
      router.refresh();
      window.setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      {showHeading && (
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Registrar visita</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Cargá qué se hizo, indicaciones, archivos y, si corresponde, la
            próxima vacuna o desparasitación.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="visit_date" className="text-sm font-semibold text-neutral-700">
          Fecha de la visita
        </label>
        <input
          id="visit_date"
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          className={inputClass}
          required
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-neutral-700">
          Tipo (opcional)
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {VISIT_TAGS.map((t) => {
            const active = tags.includes(t.value);
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleTag(t.value)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-teal-600 text-white"
                    : "border border-neutral-300 bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="summary" className="text-sm font-semibold text-neutral-700">
          Qué se hizo
        </label>
        <textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className={`${inputClass} min-h-[110px] resize-y`}
          placeholder="Ej. Aplicación de antirrábica, control general, peso 12 kg..."
          maxLength={4000}
          required
        />
      </div>

      <div>
        <label
          htmlFor="indications"
          className="text-sm font-semibold text-neutral-700"
        >
          Indicaciones para el tutor{" "}
          <span className="font-normal text-neutral-400">(opcional)</span>
        </label>
        <textarea
          id="indications"
          value={indications}
          onChange={(e) => setIndications(e.target.value)}
          className={`${inputClass} min-h-[88px] resize-y`}
          placeholder="Ej. Reposo 24 hs, dar medicación cada 12 hs..."
          maxLength={4000}
        />
      </div>

      <VisitCalendarUpdate
        enabled={updateCalendar}
        onEnabledChange={handleCalendarEnabled}
        kind={preventiveKind}
        onKindChange={setPreventiveKind}
        name={preventiveName}
        onNameChange={setPreventiveName}
        nextDue={preventiveNextDue}
        onNextDueChange={setPreventiveNextDue}
        existingItems={preventiveItems}
        selectedItemId={selectedPreventiveId}
        onSelectedItemIdChange={setSelectedPreventiveId}
        accent="teal"
        inputClass={inputClass}
      />

      <VisitFilePicker files={files} onChange={setFiles} accent="teal" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="vet_name" className="text-sm font-semibold text-neutral-700">
            Nombre del veterinario
          </label>
          <input
            id="vet_name"
            type="text"
            value={vetName}
            onChange={(e) => setVetName(e.target.value)}
            className={inputClass}
            maxLength={120}
            required
          />
        </div>
        <div>
          <label
            htmlFor="vet_license"
            className="text-sm font-semibold text-neutral-700"
          >
            Matrícula
          </label>
          <input
            id="vet_license"
            type="text"
            value={vetLicense}
            onChange={(e) => setVetLicense(e.target.value)}
            className={inputClass}
            placeholder="Ej. MP 12345"
            maxLength={60}
            required
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          Visita guardada. El tutor será notificado.
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full gap-2 !from-teal-600 !to-emerald-700 hover:!from-teal-700 hover:!to-emerald-800"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        Guardar visita
      </Button>
    </form>
  );
}

/** Encabezado clicable para secciones desplegables de la vista vet. */
export function VetCollapsibleHeader({
  title,
  subtitle,
  open,
  onToggle,
  badge,
}: {
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-start justify-between gap-3 text-left"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
          {badge ? (
            <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
              {badge}
            </span>
          ) : null}
        </div>
        {subtitle ? (
          <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
        ) : null}
      </div>
      <span
        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600 transition-transform ${
          open ? "rotate-180" : ""
        }`}
      >
        <ChevronDown className="h-5 w-5" aria-hidden />
      </span>
    </button>
  );
}
