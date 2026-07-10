import Image from "next/image";

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
    text: "Coordinación en tiempo real. Activá notificaciones para no perderte respuestas.",
    image: "/images/landing/screenshots/step-04-chat.png",
    imageAlt: "Conversación en vivo y activación de notificaciones push",
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
  {
    step: "7",
    title: "Fotos y audios",
    text: "Quien escanea puede mandar imagen o audio; la familia responde desde su panel.",
    image: "/images/landing/screenshots/step-07-media.png",
    imageAlt: "Chat SOSme con foto de mascota y mensaje de audio de la familia",
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
  {
    label: "Comunicación enriquecida",
    description: "Más allá del texto: imágenes y audios en tiempo real.",
    steps: STEPS.slice(6, 7),
  },
] as const;

type Step = (typeof STEPS)[number];

function StepCard({ step, title, text, image, imageAlt, featured = false }: Step & { featured?: boolean }) {
  return (
    <li
      className={`flex flex-col items-center text-center ${
        featured ? "mx-auto w-full max-w-sm" : "w-full"
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-lg font-black text-white shadow-lg shadow-violet-500/25 ring-4 ring-white">
        {step}
      </div>
      <h3 className="mt-6 text-xl font-bold leading-snug text-neutral-900">{title}</h3>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-600">{text}</p>
      <div
        className={`mt-8 overflow-hidden rounded-[1.75rem] border-[5px] border-neutral-900 bg-neutral-950 p-1.5 shadow-2xl shadow-violet-500/15 ${
          featured ? "w-full max-w-[17.5rem]" : "w-full max-w-[15rem]"
        }`}
      >
        <div className="overflow-hidden rounded-[1.25rem]">
          <Image
            src={image}
            alt={imageAlt}
            width={503}
            height={1024}
            className="h-auto w-full"
            sizes={featured ? "(max-width: 640px) 280px, 280px" : "(max-width: 640px) 240px, 240px"}
          />
        </div>
      </div>
    </li>
  );
}

function StepRow({
  label,
  description,
  steps,
  featuredLast = false,
}: {
  label: string;
  description: string;
  steps: readonly Step[];
  featuredLast?: boolean;
}) {
  const isSingle = steps.length === 1;

  return (
    <div className="rounded-[2rem] border border-violet-100/80 bg-gradient-to-b from-violet-50/40 to-white px-5 py-12 sm:px-8 sm:py-14 lg:px-12">
      <div className={`mx-auto max-w-2xl text-center ${isSingle ? "mb-10" : "mb-12 lg:mb-14"}`}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">{label}</p>
        <p className="mt-3 text-base leading-relaxed text-neutral-600 sm:text-lg">{description}</p>
      </div>

      <ol
        className={
          isSingle
            ? "flex justify-center"
            : "grid gap-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-16"
        }
      >
        {steps.map((step) => (
          <StepCard key={step.step} {...step} featured={featuredLast && isSingle} />
        ))}
      </ol>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="scroll-mt-32 border-y border-neutral-200/50 bg-white px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[88rem]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
            Cómo funciona
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
            Así se ve cuando alguien escanea tu QR
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">
            Capturas reales del flujo completo: ubicación, contacto, chat, datos
            médicos y botón SOS. Funciona en cualquier celular, sin instalar nada.
          </p>
        </div>

        <div className="mt-20 flex flex-col gap-10 lg:gap-14">
          {ROWS.map((row, index) => (
            <StepRow
              key={row.label}
              {...row}
              featuredLast={index === ROWS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
