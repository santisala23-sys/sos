import type { Metadata } from "next";
import { AlertTriangle, PawPrint } from "lucide-react";
import {
  getPetByValidVetToken,
  listPetVetVisits,
} from "@/lib/db/queries-pet-medical";
import { isUuid } from "@/lib/pet-medical";
import { VetVisitsList } from "@/components/vet/VetVisitsList";
import { VetVisitForm } from "@/components/vet/VetVisitForm";

type PageProps = {
  params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Libreta sanitaria — Vista veterinario",
  description: "Acceso temporal a la libreta sanitaria de la mascota",
  robots: { index: false, follow: false },
};

function InvalidLinkScreen() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-teal-50 to-neutral-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="mt-4 text-xl font-black text-neutral-900">
          Enlace expirado o inválido
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          Este acceso para veterinarios ya no es válido. Pedile al tutor que
          genere un nuevo enlace desde el panel de la mascota (válido por 24
          horas).
        </p>
      </div>
    </main>
  );
}

export default async function VetViewPage({ params }: PageProps) {
  const { token } = await params;

  if (!token || !isUuid(token)) {
    return <InvalidLinkScreen />;
  }

  const pet = await getPetByValidVetToken(token);
  if (!pet) {
    return <InvalidLinkScreen />;
  }

  const visits = await listPetVetVisits(pet.id);

  return (
    <main className="min-h-dvh bg-gradient-to-b from-teal-50 via-white to-neutral-100">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-10">
        <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
          SOSme · Vista veterinario
        </p>

        <section className="mt-4 overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-xl shadow-teal-900/5">
          <div className="bg-gradient-to-br from-teal-600 to-emerald-800 px-6 py-7 text-white">
            <div className="flex items-center gap-4">
              {pet.avatar_b64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:${pet.avatar_mime ?? "image/jpeg"};base64,${pet.avatar_b64}`}
                  alt={pet.beneficiary_name}
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white/40"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/30">
                  <PawPrint className="h-9 w-9 text-white" aria-hidden />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-teal-100">Mascota</p>
                <h1 className="truncate text-2xl font-black tracking-tight">
                  {pet.beneficiary_name}
                </h1>
              </div>
            </div>
          </div>

          {(pet.allergies?.trim() || pet.medical_notes?.trim()) && (
            <div className="space-y-3 border-b border-neutral-100 px-6 py-4 text-sm">
              {pet.allergies?.trim() && (
                <div>
                  <p className="font-semibold text-rose-700">Alergias</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-neutral-700">
                    {pet.allergies}
                  </p>
                </div>
              )}
              {pet.medical_notes?.trim() && (
                <div>
                  <p className="font-semibold text-neutral-600">Notas del tutor</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-neutral-700">
                    {pet.medical_notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="px-6 py-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
              Historial clínico
            </h2>
            <div className="mt-3">
              <VetVisitsList visits={visits} />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-teal-100 bg-white p-6 shadow-lg shadow-teal-900/5">
          <h2 className="text-lg font-bold text-neutral-900">
            Registrar visita
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Cargá qué se hizo y, si hace falta, las indicaciones para el hogar.
            El tutor recibe una notificación.
          </p>
          <div className="mt-5">
            <VetVisitForm token={token} />
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-neutral-400">
          Acceso temporal · el historial es de solo lectura · podés agregar
          visitas
        </p>
      </div>
    </main>
  );
}
