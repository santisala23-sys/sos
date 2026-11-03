const STEPS = [
  {
    step: "01",
    title: "Creás tu perfil",
    text: "Cargás contactos, instrucciones y lo que quieras que vean en una emergencia.",
  },
  {
    step: "02",
    title: "Pegás o llevás el QR",
    text: "En una chapita, collar, tarjeta o sticker. También podés imprimirlo vos mismo.",
  },
  {
    step: "03",
    title: "Te avisan al escanear",
    text: "La persona escanea, te contacta, y vos recibís alerta con ubicación opcional.",
  },
] as const;

export function WhatIsSosmeSection() {
  return (
    <section
      id="que-es"
      className="scroll-mt-32 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-[88rem] rounded-[2rem] border border-violet-200/70 bg-white/55 px-5 py-12 shadow-sm shadow-violet-500/5 backdrop-blur-sm sm:rounded-[2.5rem] sm:px-8 sm:py-14 lg:px-12 lg:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="shrink-0 lg:max-w-md xl:max-w-lg">
            <h2 className="text-3xl font-black leading-[1.05] tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.65rem]">
              ¿Qué es{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                SOSme?
              </span>
            </h2>
          </div>

          <div className="lg:max-w-xl lg:pt-1 xl:max-w-2xl">
            <p className="text-lg font-bold leading-snug text-neutral-900 sm:text-xl">
              Un QR que conecta a quien necesita ayuda con quien puede darla
            </p>
            <p className="mt-4 text-base leading-relaxed text-neutral-600 sm:text-[1.05rem]">
              Un QR único ligado a tu perfil: lo pegás en collar o credencial.
              Al escanearlo, te contactan y vos recibís la alerta al
              toque.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {STEPS.map(({ step, title, text }) => (
            <article
              key={step}
              className="flex flex-col rounded-2xl border border-violet-100/90 bg-white/80 p-6 shadow-sm transition-all hover:border-violet-200 hover:shadow-md hover:shadow-violet-500/8 sm:p-7"
            >
              <span className="text-4xl font-black tabular-nums leading-none text-violet-600 sm:text-5xl">
                {step}
              </span>
              <h3 className="mt-5 text-lg font-bold text-neutral-900 sm:text-xl">
                {title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600 sm:text-base">
                {text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
