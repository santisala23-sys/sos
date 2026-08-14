"use client";

import { useState } from "react";
import type { PetPreventiveItem, PetVetVisit } from "@/types/database";
import { VetPreventiveReadOnly } from "@/components/vet/VetPreventiveReadOnly";
import { VetVisitsList } from "@/components/vet/VetVisitsList";
import {
  VetCollapsibleHeader,
  VetVisitForm,
} from "@/components/vet/VetVisitForm";

type VetViewPanelsProps = {
  token: string;
  visits: PetVetVisit[];
  preventive: PetPreventiveItem[];
};

export function VetViewPanels({
  token,
  visits,
  preventive,
}: VetViewPanelsProps) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <>
      <div className="border-b border-neutral-100 px-6 py-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
          Vacunas y desparasitaciones
        </h2>
        <div className="mt-3">
          <VetPreventiveReadOnly items={preventive} />
        </div>
      </div>

      <div className="border-b border-neutral-100 px-6 py-5">
        <VetCollapsibleHeader
          title="Registrar visita"
          subtitle="Cargá qué se hizo, indicaciones y el calendario si corresponde."
          open={registerOpen}
          onToggle={() => setRegisterOpen((v) => !v)}
        />
        {registerOpen && (
          <div className="mt-5 border-t border-neutral-100 pt-5">
            <VetVisitForm
              token={token}
              preventiveItems={preventive}
              showHeading={false}
            />
          </div>
        )}
      </div>

      <div className="px-6 py-5">
        <VetCollapsibleHeader
          title="Historial de visitas"
          open={historyOpen}
          onToggle={() => setHistoryOpen((v) => !v)}
          badge={visits.length > 0 ? String(visits.length) : undefined}
        />
        {historyOpen && (
          <div className="mt-4">
            <VetVisitsList visits={visits} vetToken={token} />
          </div>
        )}
        {!historyOpen && visits.length > 0 && (
          <p className="mt-2 text-sm text-neutral-500">
            {visits.length} visita{visits.length === 1 ? "" : "s"} registrada
            {visits.length === 1 ? "" : "s"}. Tocá para ver el historial.
          </p>
        )}
      </div>
    </>
  );
}
