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

function StepCard({
  step,
  title,
  text,
  image,
  imageAlt,
}: (typeof STEPS)[number]) {
  return (
    <li className="flex w-[min(100%,17.5rem)] shrink-0 snap-center flex-col sm:w-[15.5rem] lg:w-[13.75rem]">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-lg font-black text-white shadow-lg shadow-violet-500/25 ring-4 ring-white">
        {step}
      </div>
      <h3 className="mt-5 text-lg font-bold leading-snug text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">{text}</p>
      <div className="mt-5 overflow-hidden rounded-[1.75rem] border-[5px] border-neutral-900 bg-neutral-950 p-1.5 shadow-2xl shadow-violet-500/15">
        <div className="overflow-hidden rounded-[1.25rem]">
          <Image
            src={image}
            alt={imageAlt}
            width={503}
            height={1024}
            className="h-auto w-full"
            sizes="(max-width: 640px) 280px, 220px"
          />
        </div>
      </div>
    </li>
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

        <div className="relative mt-16">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-16 bg-gradient-to-r from-white to-transparent lg:block"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-16 bg-gradient-to-l from-white to-transparent lg:block"
            aria-hidden
          />

          <ol className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STEPS.map((step) => (
              <StepCard key={step.step} {...step} />
            ))}
          </ol>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Deslizá horizontalmente para ver los 7 pasos →
          </p>
        </div>
      </div>
    </section>
  );
}
