import Image from "next/image";
import { ChevronRight } from "lucide-react";

const STEPS = [
  {
    step: "1",
    title: "Escanean el QR",
    text: "Se abre al instante en el navegador. Sin apps ni registros para quien ayuda.",
    image: "/images/landing/screenshots/step-01-location.png",
    imageAlt: "Pantalla SOSme pidiendo compartir ubicación tras escanear el QR",
  },
  {
    step: "2",
    title: "Vos recibís la alerta",
    text: "Al abrir el enlace se notifica al tutor. El perfil muestra foto, nombre y datos clave.",
    image: "/images/landing/screenshots/step-02-profile.png",
    imageAlt: "Perfil público SOSme con foto de mascota y aviso al tutor",
  },
  {
    step: "3",
    title: "Contacto directo",
    text: "Llamada y WhatsApp a contactos de emergencia con un toque.",
    image: "/images/landing/screenshots/step-03-contacts.png",
    imageAlt: "Contactos de emergencia con botones de llamar y WhatsApp",
  },
  {
    step: "4",
    title: "Chat en vivo",
    text: "Mensajes, fotos y audios en tiempo real. La familia responde desde su panel.",
    image: "/images/landing/screenshots/step-07-media.png",
    imageAlt: "Chat SOSme con foto de mascota y mensaje de audio de la familia",
  },
  {
    step: "5",
    title: "Datos críticos",
    text: "Alergias y restricciones visibles de inmediato para quien presta ayuda.",
    image: "/images/landing/screenshots/step-05-allergies.png",
    imageAlt: "Sección de alergias y restricciones en el perfil SOSme",
  },
  {
    step: "6",
    title: "Instrucciones claras",
    text: "Indicaciones de manejo, datos médicos o veterinarios según el tipo de perfil.",
    image: "/images/landing/screenshots/step-06-instructions.png",
    imageAlt: "Instrucciones de encuentro e información veterinaria",
  },
] as const;

const ROWS = [
  {
    label: "Escaneo y primer contacto",
    description: "Desde que alguien lee el QR hasta que la familia sabe qué pasa.",
    steps: STEPS.slice(0, 3),
  },
  {
    label: "Información y coordinación",
    description: "Chat, alertas y datos clave para actuar con seguridad.",
    steps: STEPS.slice(3, 6),
  },
] as const;

type Step = (typeof STEPS)[number];

function StepCard({ step, title, text, image, imageAlt }: Step) {
  return (
    <div className="flex w-full max-w-[16rem] flex-col items-center text-center sm:max-w-none">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-base font-black text-white shadow-md shadow-violet-500/20 ring-2 ring-white">
        {step}
      </div>
      <h3 className="mt-4 text-lg font-bold leading-snug text-neutral-900">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-neutral-600">{text}</p>
      <Image
        src={image}
        alt={imageAlt}
        width={503}
        height={1024}
        className="mt-5 h-auto w-full max-w-[14rem] rounded-2xl"
        sizes="(max-width: 640px) 224px, 224px"
      />
    </div>
  );
}

function StepRow({
  label,
  description,
  steps,
}: {
  label: string;
  description: string;
  steps: readonly Step[];
}) {
  return (
    <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">{label}</p>
        <p className="mt-2 text-base leading-relaxed text-neutral-600">{description}</p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:hidden">
        {steps.map((step) => (
          <StepCard key={step.step} {...step} />
        ))}
      </div>

      <div className="hidden lg:flex lg:items-start lg:justify-center lg:gap-1">
        {steps.map((step, index) => (
          <div key={step.step} className="flex items-start">
            <StepCard {...step} />
            {index < steps.length - 1 && (
              <div
                className="flex w-12 shrink-0 items-center justify-center self-center pt-36"
                aria-hidden
              >
                <ChevronRight className="h-7 w-7 text-violet-400" strokeWidth={2.5} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="scroll-mt-32 border-y border-neutral-200/50 bg-white px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[88rem]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
            Cómo funciona
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
            Así se ve cuando alguien escanea tu QR
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-600">
            Capturas reales del flujo completo: ubicación, contacto, chat, datos
            médicos y botón SOS. Funciona en cualquier celular, sin instalar nada.
          </p>
        </div>

        <div className="mt-14 flex flex-col gap-8">
          {ROWS.map((row) => (
            <StepRow key={row.label} {...row} />
          ))}
        </div>
      </div>
    </section>
  );
}
