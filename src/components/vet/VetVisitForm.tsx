"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  VisitFilePicker,
  type PendingVisitFile,
} from "@/components/vet/VisitFilePicker";
import { VISIT_TAGS } from "@/lib/pet-medical";
import type { PreventiveKind, VisitTag } from "@/types/database";

type VetVisitFormProps = {
  token: string;
  onPreventiveAdded?: () => void;
};

export function VetVisitForm({ token, onPreventiveAdded }: VetVisitFormProps) {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function toggleTag(tag: VisitTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
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

      <VisitFilePicker files={files} onChange={setFiles} accent="teal" />

      <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-3">
        <label className="flex items-start gap-2 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={updateCalendar}
            onChange={(e) => setUpdateCalendar(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            También actualizar calendario de vacunas / desparasitaciones
          </span>
        </label>
        {updateCalendar && (
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
                  onClick={() => setPreventiveKind(value)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                    preventiveKind === value
                      ? "bg-teal-700 text-white"
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
                value={preventiveName}
                onChange={(e) => setPreventiveName(e.target.value)}
                className={inputClass}
                placeholder="Ej. Antirrábica"
                maxLength={200}
                required={updateCalendar}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-700">
                Próxima aplicación{" "}
                <span className="font-normal text-neutral-400">(opcional)</span>
              </label>
              <input
                type="date"
                value={preventiveNextDue}
                onChange={(e) => setPreventiveNextDue(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        )}
      </div>

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
