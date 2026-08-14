"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ClipboardList, Plus } from "lucide-react";
import type { PetPreventiveItem, PetVetVisit } from "@/types/database";
import { VetVisitsList } from "@/components/vet/VetVisitsList";
import { TutorVisitForm } from "@/components/dashboard/TutorVisitForm";
import { ShareWithVetButton } from "@/components/dashboard/ShareWithVetButton";
import { PreventiveCareSection } from "@/components/dashboard/PreventiveCareSection";
import { ScheduledPreventiveBanner } from "@/components/dashboard/ScheduledPreventiveBanner";
import { Button } from "@/components/ui/Button";

type PetMedicalHistoryProps = {
  petId: string;
  petName: string;
  embedded?: boolean;
};

export function PetMedicalHistory({
  petId,
  petName,
  embedded = false,
}: PetMedicalHistoryProps) {
  const [visits, setVisits] = useState<PetVetVisit[]>([]);
  const [preventive, setPreventive] = useState<PetPreventiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitFormOpen, setVisitFormOpen] = useState(false);
  const [visitsOpen, setVisitsOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/qr-profiles/${petId}/medical-records`);
        const data = (await res.json()) as {
          visits?: PetVetVisit[];
          records?: PetVetVisit[];
          preventive?: PetPreventiveItem[];
          error?: string;
        };
        if (!res.ok) {
          setError(data.error ?? "No se pudo cargar el historial");
          setVisits([]);
          setPreventive([]);
          return;
        }
        setVisits(data.visits ?? data.records ?? []);
        setPreventive(data.preventive ?? []);
      } catch {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [petId]);

  return (
    <section
      className={
        embedded
          ? undefined
          : "rounded-3xl border border-violet-100 bg-white p-6 shadow-lg shadow-violet-500/8 sm:p-8"
      }
    >
      {!embedded && (
        <>
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
            <ClipboardList className="h-5 w-5 text-violet-600" aria-hidden />
            Libreta sanitaria
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Vacunas, desparasitaciones, visitas e indicaciones del veterinario.
          </p>
        </>
      )}

      {loading && (
        <p className="mt-4 text-sm text-neutral-500">Cargando libreta...</p>
      )}
      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className={embedded ? "mt-0" : "mt-4"}>
            <ShareWithVetButton
              petId={petId}
              petName={petName}
              label="QR para veterinario"
              className="w-full"
            />
            <p className="mt-2 text-center text-xs text-neutral-500">
              Generá un acceso temporal para que el veterinario cargue la visita.
            </p>
          </div>

          <ScheduledPreventiveBanner items={preventive} />

          <PreventiveCareSection
            petId={petId}
            items={preventive}
            onChange={setPreventive}
          />

          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
            <button
              type="button"
              onClick={() => setVisitsOpen((v) => !v)}
              aria-expanded={visitsOpen}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-700">
                    Visitas
                  </h3>
                  {visits.length > 0 && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                      {visits.length}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  Historial de consultas e indicaciones.
                </p>
              </div>
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition-transform ${
                  visitsOpen ? "rotate-180" : ""
                }`}
              >
                <ChevronDown className="h-4 w-4" aria-hidden />
              </span>
            </button>

            {visitsOpen && (
              <div className="mt-4 border-t border-neutral-200 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setVisitFormOpen(true)}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Cargar visita
                </Button>

                <TutorVisitForm
                  petId={petId}
                  open={visitFormOpen}
                  onOpenChange={setVisitFormOpen}
                  preventiveItems={preventive}
                  onCreated={(visit) => setVisits((prev) => [visit, ...prev])}
                  onPreventiveAdded={(item) =>
                    setPreventive((prev) => {
                      const idx = prev.findIndex((row) => row.id === item.id);
                      if (idx >= 0) {
                        const next = [...prev];
                        next[idx] = item;
                        return next;
                      }
                      return [...prev, item];
                    })
                  }
                />

                <div className="mt-4">
                  <VetVisitsList
                    visits={visits}
                    petId={petId}
                    emptyLabel="Todavía no hay visitas. Cargá una o compartí el QR con el veterinario."
                  />
                </div>
              </div>
            )}

            {!visitsOpen && visits.length > 0 && (
              <p className="mt-2 text-xs text-neutral-500">
                {visits.length} visita{visits.length === 1 ? "" : "s"} registrada
                {visits.length === 1 ? "" : "s"}. Tocá para ver el historial.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
