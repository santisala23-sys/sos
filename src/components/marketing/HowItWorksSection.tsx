import Image from "next/image";

const STEPS = [
  {
    step: "01",
    title: "Escanean el QR",
    text: "Se abre al instante en el navegador. Sin apps ni registros para quien ayuda.",
    image: "/images/landing/screenshots/step-01-location.png",
    imageAlt: "Pantalla SOSme pidiendo compartir ubicación tras escanear el QR",
  },
  {
    step: "02",
    title: "Vos recibís la alerta",
    text: "La notificación llega cuando comparten la ubicación exacta. El perfil muestra foto, nombre y datos clave.",
    image: "/images/landing/screenshots/step-02-profile.png",
    imageAlt: "Perfil público SOSme con foto de mascota y datos para contactar al tutor",
  },
  {
    step: "03",
    title: "Contacto directo",
    text: "Llamada y WhatsApp a contactos de emergencia con un toque. Tus números telefónicos se mantienen ocultos y privados en el servidor.",
    image: "/images/landing/screenshots/step-03-contacts.png",
    imageAlt: "Contactos de emergencia con botones de llamar y WhatsApp",
  },
  {
    step: "04",
    title: "Chat en vivo",
    text: "Mensajes, fotos y audios en tiempo real. La familia responde desde su panel.",
    image: "/images/landing/screenshots/step-07-media.png",
    imageAlt: "Chat SOSme con foto de mascota y mensaje de audio de la familia",
  },
  {
    step: "05",
    title: "Datos críticos",
    text: "Alergias y restricciones visibles de inmediato para quien presta ayuda.",
    image: "/images/landing/screenshots/step-05-allergies.png",
    imageAlt: "Sección de alergias y restricciones en el perfil SOSme",
  },
  {
    step: "06",
    title: "Instrucciones claras",
    text: "Indicaciones de manejo, datos médicos o veterinarios según el tipo de perfil.",
    image: "/images/landing/screenshots/step-06-instructions.png",
    imageAlt: "Instrucciones de encuentro e información veterinaria",
  },
] as const;

const PHASES = [
  {
    label: "Escaneo y primer contacto",
    description:
      "Desde que alguien lee el QR hasta que la familia sabe qué pasa.",
    steps: STEPS.slice(0, 3),
  },
  {
    label: "Información y coordinación",
    description: "Chat, alertas y datos clave para actuar con seguridad.",
    steps: STEPS.slice(3, 6),
  },
] as const;

type Step = (typeof STEPS)[number];

function PhoneScreenshot({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[11.5rem] sm:max-w-[12.5rem]">
      <Image
        src={src}
        alt={alt}
        width={503}
        height={1024}
        className="h-auto w-full rounded-2xl shadow-md shadow-violet-500/10"
        sizes="200px"
      />
    </div>
  );
}

function StepCard({ step, title, text, image, imageAlt }: Step) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-violet-100/90 bg-white/80 p-5 shadow-sm sm:p-6">
      <PhoneScreenshot src={image} alt={imageAlt} />
      <span className="mt-5 text-3xl font-black tabular-nums leading-none text-violet-600">
        {step}
      </span>
      <h3 className="mt-3 text-lg font-bold leading-snug text-neutral-900">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">
        {text}
      </p>
    </article>
  );
}

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="scroll-mt-32 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-[88rem]">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black leading-[1.08] tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.75rem]">
            Cómo{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
              funciona
            </span>
          </h2>
          <p className="mt-3 text-lg font-medium leading-snug text-neutral-600 sm:text-xl">
            Así se ve cuando alguien{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text font-semibold text-transparent">
              escanea tu QR
            </span>
          </p>
        </div>

        <div className="mt-12 space-y-10 sm:mt-14 lg:space-y-12">
          {PHASES.map((phase) => (
            <div
              key={phase.label}
              className="rounded-[2rem] border border-violet-200/70 bg-white/55 p-5 shadow-sm shadow-violet-500/5 backdrop-blur-sm sm:rounded-[2.5rem] sm:p-8 lg:p-10"
            >
              <div className="max-w-2xl">
                <p className="text-sm font-bold tracking-[0.12em] text-violet-600">
                  {phase.label}
                </p>
                <p className="mt-2 text-base leading-relaxed text-neutral-600">
                  {phase.description}
                </p>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {phase.steps.map((step) => (
                  <StepCard key={step.step} {...step} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
