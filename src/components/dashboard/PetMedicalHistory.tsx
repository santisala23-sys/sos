"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import type { PetVetVisit } from "@/types/database";
import { VetVisitsList } from "@/components/vet/VetVisitsList";
import { TutorVisitForm } from "@/components/dashboard/TutorVisitForm";

type PetMedicalHistoryProps = {
  petId: string;
};

export function PetMedicalHistory({ petId }: PetMedicalHistoryProps) {
  const [visits, setVisits] = useState<PetVetVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/qr-profiles/${petId}/medical-records`);
        const data = (await res.json()) as {
          visits?: PetVetVisit[];
          records?: PetVetVisit[];
          error?: string;
        };
        if (!res.ok) {
          setError(data.error ?? "No se pudo cargar el historial");
          setVisits([]);
          return;
        }
        setVisits(data.visits ?? data.records ?? []);
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
        Historial de visitas: lo que se hizo y las indicaciones del veterinario.
      </p>

      <TutorVisitForm
        petId={petId}
        onCreated={(visit) => setVisits((prev) => [visit, ...prev])}
      />

      {loading && (
        <p className="mt-4 text-sm text-neutral-500">Cargando historial...</p>
      )}
      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="mt-5">
          <VetVisitsList
            visits={visits}
            emptyLabel="Todavía no hay visitas. Agregá una vos o compartí el acceso con un veterinario."
          />
        </div>
      )}
    </section>
  );
}
