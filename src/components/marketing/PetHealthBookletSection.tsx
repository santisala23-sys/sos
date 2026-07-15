import {
  Bell,
  ClipboardList,
  QrCode,
  Stethoscope,
} from "lucide-react";
import { SectionHeading } from "@/components/marketing/SectionHeading";

const STEPS = [
  {
    step: "01",
    title: "El tutor comparte un QR temporal",
    text: "Desde la libreta de la mascota generás un enlace y QR válidos por 24 horas para el veterinario.",
    icon: QrCode,
  },
  {
    step: "02",
    title: "El vet ve el historial y carga la visita",
    text: "Consulta vacunas, desparasitaciones e historial. Registra qué hizo e indicaciones (opcionales).",
    icon: Stethoscope,
  },
  {
    step: "03",
    title: "Vos recibís el aviso y queda guardado",
    text: "La visita queda en la libreta con verificación profesional. También podés cargar visitas vos.",
    icon: Bell,
  },
] as const;

export function PetHealthBookletSection() {
  return (
    <section
      id="libreta-sanitaria"
      className="scroll-mt-32 border-y border-violet-100/80 bg-white/70 px-4 py-24 backdrop-blur-sm sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[88rem]">
        <SectionHeading
          eyebrow="Libreta sanitaria digital"
          title="El veterinario escanea, carga la visita y vos tenés el historial"
          description="Además del QR de emergencia, tus mascotas tienen libreta sanitaria: vacunas, desparasitaciones, visitas e indicaciones, con acceso temporal y seguro para el profesional."
        />

        <div className="mx-auto mt-10 flex max-w-xl items-center justify-center gap-3 rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50 to-emerald-50 px-5 py-4 text-sm font-semibold text-teal-900 shadow-sm">
          <ClipboardList className="h-5 w-5 shrink-0 text-teal-700" aria-hidden />
          Vacunas, próximas dosis, visitas y archivos (imagen o PDF)
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ step, title, text, icon: Icon }) => (
            <article
              key={step}
              className="group relative overflow-hidden rounded-3xl border border-teal-100/80 bg-gradient-to-b from-white to-teal-50/40 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10"
            >
              <span className="text-6xl font-black text-teal-100/90">
                {step}
              </span>
              <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-lg shadow-teal-500/25 transition-transform group-hover:scale-105">
                <Icon className="h-7 w-7" aria-hidden />
              </div>
              <h3 className="mt-6 text-xl font-bold text-neutral-900">
                {title}
              </h3>
              <p className="mt-3 leading-relaxed text-neutral-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
