"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import type { PetPreventiveItem, PetVetVisit } from "@/types/database";
import { VetVisitsList } from "@/components/vet/VetVisitsList";
import { TutorVisitForm } from "@/components/dashboard/TutorVisitForm";
import { ShareWithVetButton } from "@/components/dashboard/ShareWithVetButton";
import { PreventiveCareSection } from "@/components/dashboard/PreventiveCareSection";
import { Button } from "@/components/ui/Button";

type PetMedicalHistoryProps = {
  petId: string;
  petName: string;
};

export function PetMedicalHistory({ petId, petName }: PetMedicalHistoryProps) {
  const [visits, setVisits] = useState<PetVetVisit[]>([]);
  const [preventive, setPreventive] = useState<PetPreventiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitFormOpen, setVisitFormOpen] = useState(false);

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
    <section className="rounded-3xl border border-violet-100 bg-white p-6 shadow-lg shadow-violet-500/8 sm:p-8">
      <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
        <ClipboardList className="h-5 w-5 text-violet-600" aria-hidden />
        Libreta sanitaria
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Vacunas, desparasitaciones, visitas e indicaciones del veterinario.
      </p>

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
          <PreventiveCareSection
            petId={petId}
            items={preventive}
            onChange={setPreventive}
          />

          <div className="mt-6 border-t border-neutral-100 pt-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
              Visitas
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Cargá una visita vos, o generá un QR para que el veterinario la
              complete.
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setVisitFormOpen(true)}
                className="w-full flex-1 gap-2"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Cargar visita
              </Button>
              <ShareWithVetButton
                petId={petId}
                petName={petName}
                label="QR para veterinario"
                className="w-full flex-1"
              />
            </div>

            <TutorVisitForm
              petId={petId}
              open={visitFormOpen}
              onOpenChange={setVisitFormOpen}
              onCreated={(visit) => setVisits((prev) => [visit, ...prev])}
            />

            <div className="mt-5">
              <VetVisitsList
                visits={visits}
                petId={petId}
                emptyLabel="Todavía no hay visitas. Cargá una o compartí el QR con el veterinario."
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
