import Image from "next/image";
import Link from "next/link";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { HeroVisual } from "@/components/marketing/LandingVisuals";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import {
  ArrowRight,
  Bell,
  MapPin,
  MessageCircle,
  Package,
  QrCode,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const TRUST_PILLS = [
  { icon: Smartphone, label: "Sin instalar apps" },
  { icon: Bell, label: "Alerta al instante" },
  { icon: MessageCircle, label: "WhatsApp directo" },
  { icon: Shield, label: "Gratis para empezar" },
] as const;

const USE_CASES = [
  {
    title: "Personas",
    description:
      "Ideal para niños, adultos mayores o quien necesite un contacto de emergencia visible.",
    detail: "Alergias, medicación e instrucciones si hace falta ayuda.",
    accent: "from-rose-500/15 to-orange-500/10",
    image: "/images/landing/use-case-personas.png",
    imageAlt: "Tarjeta con código QR guardada en el bolsillo de una chaqueta",
  },
  {
    title: "Mascotas",
    description:
      "Collar o chapita con QR: quien encuentra a tu mascota sabe cómo avisarte.",
    detail: "Llamada o WhatsApp al dueño en segundos.",
    accent: "from-amber-500/15 to-yellow-500/10",
    image: "/images/landing/use-case-mascotas.png",
    imageAlt: "Perro con collar y chapita que muestra un código QR",
  },
  {
    title: "Objetos y valijas",
    description:
      "Pegá un QR en tu valija, mochila o notebook para que te contacten si se pierde.",
    detail: "Perfecto para viajes, colegio o el día a día.",
    accent: "from-sky-500/15 to-indigo-500/10",
    image: "/images/landing/use-case-valijas.png",
    imageAlt: "Valija de viaje con un sticker de código QR en el aeropuerto",
  },
] as const;

const HOW_IT_WORKS = [
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

const INCLUDES = [
  { icon: QrCode, text: "Perfil online con tus datos de contacto" },
  { icon: MessageCircle, text: "WhatsApp y llamada al instante" },
  { icon: MapPin, text: "Ubicación cuando escanean (opcional)" },
  { icon: Bell, text: "Alerta en tu celular al escanear" },
  { icon: Smartphone, text: "Sin apps: funciona en el navegador" },
  { icon: Zap, text: "Sin cuotas mensuales" },
] as const;

export default function HomePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#f8f6fc] text-neutral-900">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-violet-300/30 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(139 92 246 / 0.08) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <MarketingNavbar />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:pt-16">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-4 py-1.5 text-sm font-semibold text-violet-800 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-600" />
                </span>
                Sistema de contacto y emergencia por QR
              </p>

              <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.4rem]">
                Si alguien encuentra lo que importa,{" "}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                  sabe cómo ayudarte
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 sm:text-xl lg:mx-0">
                <strong className="font-semibold text-neutral-800">SOSme</strong>{" "}
                vincula un código QR a tu perfil de emergencia. Lo pegás en una
                persona, mascota u objeto — y quien lo escanea puede contactarte
                al instante mientras vos recibís la alerta.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 px-8 shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
                  >
                    Crear perfil gratis
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </Button>
                </Link>
                <Link href="/tienda">
                  <Button variant="secondary" size="lg" className="gap-2">
                    <Package className="h-5 w-5" aria-hidden />
                    Ver productos físicos
                  </Button>
                </Link>
              </div>
            </div>

            <HeroVisual />
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_PILLS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center justify-center gap-2.5 rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur-sm"
              >
                <Icon className="h-4 w-4 shrink-0 text-violet-600" aria-hidden />
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* Qué es */}
        <section
          id="que-es"
          className="scroll-mt-28 border-y border-violet-100/80 bg-white/60 px-4 py-20 backdrop-blur-sm"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
                ¿Qué es SOSme?
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
                Un QR que conecta a quien necesita ayuda con quien puede darla
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-neutral-600">
                Creás un perfil con tus datos de contacto. Ese perfil tiene un
                código QR único. Lo imprimís, lo pegás en un collar, credencial
                o valija — y listo. Cuando alguien lo escanea, ve cómo
                contactarte y vos recibís una notificación al toque.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Creás tu perfil",
                  text: "Cargás contactos, instrucciones y lo que quieras que vean en una emergencia.",
                  icon: QrCode,
                },
                {
                  step: "02",
                  title: "Pegás o llevás el QR",
                  text: "En una chapita, collar, tarjeta o sticker. También podés imprimirlo vos gratis.",
                  icon: Package,
                },
                {
                  step: "03",
                  title: "Te avisan al escanear",
                  text: "La persona escanea, te contacta, y vos recibís alerta con ubicación opcional.",
                  icon: Bell,
                },
              ].map(({ step, title, text, icon: Icon }) => (
                <article
                  key={step}
                  className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-b from-white to-violet-50/40 p-7 shadow-sm"
                >
                  <span className="text-5xl font-black text-violet-100">
                    {step}
                  </span>
                  <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-neutral-900">
                    {title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-neutral-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Casos de uso */}
        <section id="casos" className="scroll-mt-28 mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
              Casos de uso
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
              Para lo que más te importa
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Un mismo sistema, adaptado a personas, mascotas u objetos.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {USE_CASES.map(
              ({ title, description, detail, accent, image, imageAlt }) => (
                <article
                  key={title}
                  className={`group overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br ${accent} shadow-sm transition-shadow hover:shadow-lg hover:shadow-violet-500/5`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-white/50">
                    <Image
                      src={image}
                      alt={imageAlt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-black text-neutral-900">
                      {title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-neutral-700">
                      {description}
                    </p>
                    <p className="mt-3 text-sm font-medium text-neutral-500">
                      {detail}
                    </p>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>

        {/* Cómo funciona */}
        <section
          id="como-funciona"
          className="scroll-mt-28 border-y border-neutral-200/60 bg-white px-4 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
                Cómo funciona
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
                Tres pasos, cero complicaciones
              </h2>
              <p className="mt-4 text-lg text-neutral-600">
                Funciona con cualquier celular. Sin apps, sin registros para
                quien escanea.
              </p>
            </div>

            <ol className="mt-16 grid gap-12 sm:grid-cols-3 lg:gap-8">
              {HOW_IT_WORKS.map(({ step, title, text, image, imageAlt }, index) => (
                <li key={step} className="relative flex flex-col text-center">
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div
                      className="absolute left-[calc(50%+6rem)] top-16 hidden h-px w-[calc(100%-8rem)] bg-gradient-to-r from-violet-300 to-indigo-300 sm:block"
                      aria-hidden
                    />
                  )}
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xl font-black text-white shadow-lg shadow-violet-500/25">
                    {step}
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-neutral-900">
                    {title}
                  </h3>
                  <p className="mt-2 text-neutral-600">{text}</p>
                  <div className="mx-auto mt-8 w-full max-w-[220px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-violet-500/10">
                    <Image
                      src={image}
                      alt={imageAlt}
                      width={390}
                      height={844}
                      className="h-auto w-full"
                      sizes="220px"
                    />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Qué incluye */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="overflow-hidden rounded-[2rem] border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50/50 p-8 shadow-xl shadow-violet-500/5 lg:grid lg:grid-cols-2 lg:gap-12 lg:p-12">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
                Todo incluido
              </p>
              <h2 className="mt-3 text-3xl font-black text-neutral-900">
                Lo que necesitás para estar tranquilo
              </h2>
              <p className="mt-4 text-lg text-neutral-600">
                Cada perfil SOSme incluye herramientas pensadas para emergencias
                reales, no solo un QR estático.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {INCLUDES.map(({ icon: Icon, text }) => (
                  <li
                    key={text}
                    className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="pt-1 text-sm font-medium text-neutral-800">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 flex items-center justify-center lg:mt-0">
              <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 shadow-lg shadow-violet-500/10">
                <Image
                  src="/images/landing/screenshots/live-chat-map.png"
                  alt="Panel de SOSme con mapa y chat en vivo"
                  width={390}
                  height={844}
                  className="mx-auto h-auto w-full max-w-xs"
                  sizes="320px"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Elegí cómo empezar */}
        <section className="mx-auto max-w-6xl px-4 py-8 pb-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
              Elegí cómo empezar
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Comprás un producto listo para usar, o creás tu perfil digital
              gratis e imprimís el QR vos mismo.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-violet-300 bg-white p-8 shadow-xl shadow-violet-500/10">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[4rem] bg-gradient-to-bl from-violet-100 to-transparent" />
              <p className="relative inline-flex w-fit items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-800">
                <Package className="h-3.5 w-3.5" aria-hidden />
                Producto físico
              </p>
              <h3 className="relative mt-4 text-2xl font-black text-neutral-900">
                Comprás y activás una vez
              </h3>
              <p className="relative mt-2 text-neutral-600">
                Ideal si querés collar, chapita o credencial listos para usar.
              </p>
              <ol className="relative mt-6 flex-1 space-y-4 text-neutral-700">
                {[
                  "Pedís el collar, colgante o credencial",
                  "Escaneás el QR una sola vez y te registrás",
                  "Listo: queda vinculado a tu perfil para siempre",
                ].map((item, i) => (
                  <li key={item} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
              <Link href="/tienda" className="relative mt-8 block">
                <Button size="lg" className="w-full gap-2">
                  Ver tienda
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
              </Link>
              <p className="relative mt-3 text-center text-sm text-neutral-500">
                ¿Ya lo tenés?{" "}
                <Link
                  href="/activar"
                  className="font-semibold text-violet-700 hover:underline"
                >
                  Activar código
                </Link>
              </p>
            </article>

            <article className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-700">
                <QrCode className="h-3.5 w-3.5" aria-hidden />
                Digital gratis
              </p>
              <h3 className="mt-4 text-2xl font-black text-neutral-900">
                Creás la cuenta e imprimís
              </h3>
              <p className="mt-2 text-neutral-600">
                Perfecto para probar o si preferís armar tu propio QR.
              </p>
              <ol className="mt-6 flex-1 space-y-4 text-neutral-700">
                {[
                  "Te registrás gratis (1 perfil incluido)",
                  "Completás los datos de contacto",
                  "Descargás PNG o imprimís PDF",
                ].map((item, i) => (
                  <li key={item} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-700">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
              <Link href="/register" className="mt-8 block">
                <Button variant="secondary" size="lg" className="w-full">
                  Crear perfil gratis
                </Button>
              </Link>
              <p className="mt-3 text-center text-sm text-neutral-500">
                ¿Necesitás más de 1?{" "}
                <Link
                  href="/pricing"
                  className="font-semibold text-violet-700 hover:underline"
                >
                  Ver planes
                </Link>
              </p>
            </article>
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 px-6 py-16 text-center shadow-2xl shadow-violet-500/30 sm:px-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              aria-hidden
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <h2 className="relative text-3xl font-black text-white sm:text-4xl">
              Protegé lo que más importa hoy
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-violet-100">
              Creá tu perfil gratis en minutos o elegí un producto físico listo
              para activar.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-violet-700 shadow-lg hover:bg-violet-50"
                >
                  Empezar gratis
                </Button>
              </Link>
              <Link href="/tienda">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  Ver productos
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}
