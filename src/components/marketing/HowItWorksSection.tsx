import Image from "next/image";

const STEPS = [
  {
    step: "1",
    title: "Escanean el QR",
    text: "Con la cámara del celular. No hace falta descargar nada.",
    image: "/images/landing/screenshots/scan-location.png",
    imageAlt: "Celular escaneando un QR SOSme",
  },
  {
    step: "2",
    title: "Ven cómo contactarte",
    text: "WhatsApp, llamada y ubicación en el mapa, al instante.",
    image: "/images/landing/screenshots/public-profile.png",
    imageAlt: "Perfil público con contactos de emergencia",
  },
  {
    step: "3",
    title: "Vos recibís la alerta",
    text: "Notificación push en tu celular cuando alguien escanea.",
    image: "/images/landing/screenshots/push-alert.png",
    imageAlt: "Notificación push de alerta SOSme",
  },
] as const;

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
            Tres pasos, cero complicaciones
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">
            Funciona con cualquier celular. Sin apps, sin registros para quien
            escanea.
          </p>
        </div>

        <ol className="relative mt-20 hidden sm:grid sm:grid-cols-3 sm:gap-8 lg:gap-12">
          {STEPS.map(({ step, title, text, image, imageAlt }) => (
            <li key={step} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-black text-white shadow-xl shadow-violet-500/30 ring-4 ring-white">
                {step}
              </div>
              <h3 className="mt-6 text-xl font-bold text-neutral-900">{title}</h3>
              <p className="mt-3 min-h-[3rem] text-neutral-600">{text}</p>
              <div className="mt-8 w-full max-w-[220px] overflow-hidden rounded-[1.75rem] border-[5px] border-neutral-900 bg-neutral-950 p-1.5 shadow-2xl shadow-violet-500/15">
                <div className="overflow-hidden rounded-[1.25rem]">
                  <Image
                    src={image}
                    alt={imageAlt}
                    width={390}
                    height={844}
                    className="h-auto w-full"
                    sizes="220px"
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>

        <ol className="mt-16 flex flex-col gap-12 sm:hidden">
          {STEPS.map(({ step, title, text, image, imageAlt }, index) => (
            <li key={step} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-black text-white shadow-xl shadow-violet-500/30 ring-4 ring-white">
                {step}
              </div>
              <h3 className="relative z-10 mt-6 text-xl font-bold text-neutral-900">{title}</h3>
              <p className="relative z-10 mt-3 text-neutral-600">{text}</p>
              <div className="relative z-10 mt-8 w-full max-w-[220px] overflow-hidden rounded-[1.75rem] border-[5px] border-neutral-900 bg-neutral-950 p-1.5 shadow-2xl shadow-violet-500/15">
                <div className="overflow-hidden rounded-[1.25rem]">
                  <Image
                    src={image}
                    alt={imageAlt}
                    width={390}
                    height={844}
                    className="h-auto w-full"
                    sizes="220px"
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
