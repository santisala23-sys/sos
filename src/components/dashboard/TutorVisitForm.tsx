"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  VisitFilePicker,
  type PendingVisitFile,
} from "@/components/vet/VisitFilePicker";
import { VisitCalendarUpdate } from "@/components/vet/VisitCalendarUpdate";
import { VISIT_TAGS } from "@/lib/pet-medical";
import type {
  PetPreventiveItem,
  PetVetVisit,
  PreventiveKind,
  VisitTag,
} from "@/types/database";

type TutorVisitFormProps = {
  petId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (visit: PetVetVisit) => void;
  onPreventiveAdded?: (item: PetPreventiveItem) => void;
};

export function TutorVisitForm({
  petId,
  open,
  onOpenChange,
  onCreated,
  onPreventiveAdded,
}: TutorVisitFormProps) {
  const [visitDate, setVisitDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [summary, setSummary] = useState("");
  const [indications, setIndications] = useState("");
  const [tags, setTags] = useState<VisitTag[]>([]);
  const [vetName, setVetName] = useState("");
  const [vetLicense, setVetLicense] = useState("");
  const [files, setFiles] = useState<PendingVisitFile[]>([]);
  const [updateCalendar, setUpdateCalendar] = useState(false);
  const [preventiveKind, setPreventiveKind] = useState<PreventiveKind>("vaccine");
  const [preventiveName, setPreventiveName] = useState("");
  const [preventiveNextDue, setPreventiveNextDue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function toggleTag(tag: VisitTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function resetForm() {
    setSummary("");
    setIndications("");
    setTags([]);
    setVetName("");
    setVetLicense("");
    setFiles([]);
    setUpdateCalendar(false);
    setPreventiveName("");
    setPreventiveNextDue("");
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/qr-profiles/${petId}/medical-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visit_date: visitDate,
          summary,
          indications,
          tags,
          vet_name: vetName || null,
          vet_license: vetLicense || null,
          attachments: files,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        visit?: PetVetVisit;
      };

      if (!res.ok || !data.visit) {
        setError(data.error ?? "No se pudo guardar la visita");
        return;
      }

      if (updateCalendar && preventiveName.trim()) {
        const prevRes = await fetch(`/api/qr-profiles/${petId}/preventive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: preventiveKind,
            name: preventiveName.trim(),
            last_applied_at: visitDate,
            next_due_at: preventiveNextDue || null,
          }),
        });
        const prevData = (await prevRes.json()) as {
          item?: PetPreventiveItem;
        };
        if (prevRes.ok && prevData.item) {
          onPreventiveAdded?.(prevData.item);
        }
      }

      onCreated(data.visit);
      setSuccess(true);
      resetForm();
      onOpenChange(false);
      window.setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";

  if (!open) {
    if (!success) return null;
    return (
      <p
        role="status"
        className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
        Visita agregada a la libreta
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="mt-4 space-y-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-neutral-900">Nueva visita</h3>
        <button
          type="button"
          onClick={() => {
            onOpenChange(false);
            setError(null);
          }}
          className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
        >
          Cancelar
        </button>
      </div>

      <div>
        <label htmlFor="tutor_visit_date" className="text-sm font-semibold text-neutral-700">
          Fecha
        </label>
        <input
          id="tutor_visit_date"
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
                    ? "bg-violet-600 text-white"
                    : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="tutor_summary" className="text-sm font-semibold text-neutral-700">
          Qué se hizo
        </label>
        <textarea
          id="tutor_summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className={`${inputClass} min-h-[96px] resize-y`}
          placeholder="Ej. Vacuna anual en la veterinaria de barrio..."
          maxLength={4000}
          required
        />
      </div>

      <div>
        <label
          htmlFor="tutor_indications"
          className="text-sm font-semibold text-neutral-700"
        >
          Indicaciones{" "}
          <span className="font-normal text-neutral-400">(opcional)</span>
        </label>
        <textarea
          id="tutor_indications"
          value={indications}
          onChange={(e) => setIndications(e.target.value)}
          className={`${inputClass} min-h-[72px] resize-y`}
          placeholder="Indicaciones que te dieron, si las hay"
          maxLength={4000}
        />
      </div>

      <VisitCalendarUpdate
        enabled={updateCalendar}
        onEnabledChange={setUpdateCalendar}
        kind={preventiveKind}
        onKindChange={setPreventiveKind}
        name={preventiveName}
        onNameChange={setPreventiveName}
        nextDue={preventiveNextDue}
        onNextDueChange={setPreventiveNextDue}
        accent="violet"
        inputClass={inputClass}
      />

      <VisitFilePicker files={files} onChange={setFiles} accent="violet" />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="tutor_vet_name" className="text-sm font-semibold text-neutral-700">
            Veterinario{" "}
            <span className="font-normal text-neutral-400">(opcional)</span>
          </label>
          <input
            id="tutor_vet_name"
            type="text"
            value={vetName}
            onChange={(e) => setVetName(e.target.value)}
            className={inputClass}
            maxLength={120}
          />
        </div>
        <div>
          <label
            htmlFor="tutor_vet_license"
            className="text-sm font-semibold text-neutral-700"
          >
            Matrícula{" "}
            <span className="font-normal text-neutral-400">(opcional)</span>
          </label>
          <input
            id="tutor_vet_license"
            type="text"
            value={vetLicense}
            onChange={(e) => setVetLicense(e.target.value)}
            className={inputClass}
            maxLength={60}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        Guardar visita
      </Button>
    </form>
  );
}
