import Image from "next/image";
import Link from "next/link";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import {
  ArrowRight,
  Bell,
  MapPin,
  MessageCircle,
  Package,
  QrCode,
  Shield,
  Smartphone,
  Sparkles,
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
    accent: "from-rose-500/20 to-orange-500/10",
    image: "/images/landing/use-case-personas.png",
    imageAlt: "Tarjeta con código QR guardada en el bolsillo de una chaqueta",
  },
  {
    title: "Mascotas",
    description:
      "Collar o chapita con QR: quien encuentra a tu mascota sabe cómo avisarte.",
    detail: "Llamada o WhatsApp al dueño en segundos.",
    accent: "from-amber-500/20 to-yellow-500/10",
    image: "/images/landing/use-case-mascotas.png",
    imageAlt: "Perro con collar y chapita que muestra un código QR",
  },
  {
    title: "Objetos y valijas",
    description:
      "Pegá un QR en tu valija, mochila o notebook para que te contacten si se pierde.",
    detail: "Perfecto para viajes, colegio o el día a día.",
    accent: "from-sky-500/20 to-indigo-500/10",
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

const HERO_STATS = [
  { value: "3 pasos", label: "para activar" },
  { value: "0 apps", label: "para escanear" },
  { value: "1 gratis", label: "perfil incluido" },
] as const;

export default function HomePage() {
  return (
    <MarketingBackground>
      <MarketingNavbar />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-[88rem] px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-violet-800 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-violet-600" aria-hidden />
                Sistema de contacto y emergencia por QR
              </p>

              <h1 className="mt-7 text-4xl font-black leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                Si alguien encuentra lo que importa,{" "}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                  sabe cómo ayudarte
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 sm:text-xl lg:mx-0">
                <strong className="font-semibold text-neutral-800">SOSme</strong>{" "}
                vincula un código QR a tu perfil de emergencia. Lo pegás en una
                persona, mascota u objeto — quien lo escanea te contacta al
                instante y vos recibís la alerta.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 px-8 shadow-xl shadow-violet-500/30 hover:from-violet-700 hover:to-indigo-700"
                  >
                    Crear perfil gratis
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </Button>
                </Link>
                <Link href="/tienda">
                  <Button variant="secondary" size="lg" className="gap-2 px-8">
                    <Package className="h-5 w-5" aria-hidden />
                    Ver productos físicos
                  </Button>
                </Link>
              </div>

              <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-violet-100 pt-8">
                {HERO_STATS.map(({ value, label }) => (
                  <div key={label} className="text-center lg:text-left">
                    <dt className="text-2xl font-black text-violet-700 sm:text-3xl">
                      {value}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-neutral-500">
                      {label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-violet-400/20 via-indigo-300/15 to-rose-300/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/70 p-2 shadow-2xl shadow-violet-500/20 backdrop-blur-sm">
                <Image
                  src="/images/landing/hero-scan.png"
                  alt="Persona mostrando su tarjeta QR mientras alguien la escanea con el celular"
                  width={1024}
                  height={1024}
                  priority
                  className="h-auto w-full rounded-[1.5rem]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_PILLS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center justify-center gap-3 rounded-2xl border border-white/90 bg-white/75 px-5 py-4 text-sm font-semibold text-neutral-700 shadow-sm backdrop-blur-sm"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* Qué es */}
        <section
          id="que-es"
          className="scroll-mt-32 border-y border-violet-100/80 bg-white/70 px-4 py-24 backdrop-blur-sm sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-[88rem]">
            <SectionHeading
              eyebrow="¿Qué es SOSme?"
              title="Un QR que conecta a quien necesita ayuda con quien puede darla"
              description="Creás un perfil con tus datos de contacto. Ese perfil tiene un código QR único. Lo imprimís, lo pegás en un collar, credencial o valija — y listo. Cuando alguien lo escanea, ve cómo contactarte y vos recibís una notificación al toque."
            />

            <div className="mt-16 grid gap-6 md:grid-cols-3">
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
                  className="group relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-b from-white to-violet-50/50 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10"
                >
                  <span className="text-6xl font-black text-violet-100/90">
                    {step}
                  </span>
                  <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 transition-transform group-hover:scale-105">
                    <Icon className="h-7 w-7" aria-hidden />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-neutral-900">
                    {title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-neutral-600">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Casos de uso */}
        <section
          id="casos"
          className="scroll-mt-32 mx-auto max-w-[88rem] px-4 py-24 sm:px-6 lg:px-8"
        >
          <SectionHeading
            eyebrow="Casos de uso"
            title="Para lo que más te importa"
            description="Un mismo sistema, adaptado a personas, mascotas u objetos."
          />

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {USE_CASES.map(
              ({ title, description, detail, accent, image, imageAlt }) => (
                <article
                  key={title}
                  className={`group overflow-hidden rounded-[1.75rem] border border-white/90 bg-gradient-to-br ${accent} shadow-lg shadow-violet-500/5 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/15`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-white/40">
                    <Image
                      src={image}
                      alt={imageAlt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-black">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/90">
                        {description}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-white/50 bg-white/60 px-6 py-4 backdrop-blur-sm">
                    <p className="text-sm font-medium text-neutral-600">
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
          className="scroll-mt-32 border-y border-neutral-200/50 bg-white px-4 py-24 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-[88rem]">
            <SectionHeading
              eyebrow="Cómo funciona"
              title="Tres pasos, cero complicaciones"
              description="Funciona con cualquier celular. Sin apps, sin registros para quien escanea."
            />

            <ol className="mt-20 grid gap-14 sm:grid-cols-3 lg:gap-10">
              {HOW_IT_WORKS.map(({ step, title, text, image, imageAlt }, index) => (
                <li key={step} className="relative flex flex-col text-center">
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div
                      className="absolute left-[calc(50%+7rem)] top-20 hidden h-px w-[calc(100%-10rem)] bg-gradient-to-r from-violet-300 to-indigo-300 sm:block"
                      aria-hidden
                    />
                  )}
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-black text-white shadow-xl shadow-violet-500/30">
                    {step}
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-neutral-900">
                    {title}
                  </h3>
                  <p className="mt-3 text-neutral-600">{text}</p>
                  <div className="mx-auto mt-10 w-full max-w-[260px] overflow-hidden rounded-[1.75rem] border-[5px] border-neutral-900 bg-neutral-950 p-1.5 shadow-2xl shadow-violet-500/15">
                    <div className="overflow-hidden rounded-[1.25rem]">
                      <Image
                        src={image}
                        alt={imageAlt}
                        width={390}
                        height={844}
                        className="h-auto w-full"
                        sizes="260px"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Qué incluye */}
        <section className="mx-auto max-w-[88rem] px-4 py-24 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2.5rem] border border-violet-100/80 bg-gradient-to-br from-white via-white to-violet-50/60 p-8 shadow-2xl shadow-violet-500/8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:p-14">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Todo incluido"
                title="Lo que necesitás para estar tranquilo"
                description="Cada perfil SOSme incluye herramientas pensadas para emergencias reales, no solo un QR estático."
              />
              <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                {INCLUDES.map(({ icon: Icon, text }) => (
                  <li
                    key={text}
                    className="flex items-start gap-3 rounded-2xl border border-white/90 bg-white/90 p-4 shadow-sm"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="pt-1.5 text-sm font-semibold text-neutral-800">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-12 flex items-center justify-center lg:mt-0">
              <div className="absolute -inset-8 rounded-full bg-violet-200/40 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-neutral-900 bg-neutral-950 p-2 shadow-2xl shadow-violet-500/20">
                <Image
                  src="/images/landing/screenshots/live-chat-map.png"
                  alt="Panel de SOSme con mapa y chat en vivo"
                  width={390}
                  height={844}
                  className="h-auto w-full max-w-[300px] rounded-[1.25rem]"
                  sizes="300px"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Elegí cómo empezar */}
        <section className="mx-auto max-w-[88rem] px-4 py-8 pb-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Empezá hoy"
            title="Elegí cómo empezar"
            description="Comprás un producto listo para usar, o creás tu perfil digital gratis e imprimís el QR vos mismo."
          />

          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <article className="relative flex flex-col overflow-hidden rounded-[2rem] border-2 border-violet-300 bg-white p-9 shadow-2xl shadow-violet-500/15">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-[5rem] bg-gradient-to-bl from-violet-100 to-transparent" />
              <p className="relative inline-flex w-fit items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-800">
                <Package className="h-3.5 w-3.5" aria-hidden />
                Producto físico
              </p>
              <h3 className="relative mt-5 text-2xl font-black text-neutral-900 sm:text-3xl">
                Comprás y activás una vez
              </h3>
              <p className="relative mt-3 text-neutral-600">
                Ideal si querés collar, chapita o credencial listos para usar.
              </p>
              <ol className="relative mt-8 flex-1 space-y-5 text-neutral-700">
                {[
                  "Pedís el collar, colgante o credencial",
                  "Escaneás el QR una sola vez y te registrás",
                  "Listo: queda vinculado a tu perfil para siempre",
                ].map((item, i) => (
                  <li key={item} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{item}</span>
                  </li>
                ))}
              </ol>
              <Link href="/tienda" className="relative mt-10 block">
                <Button size="lg" className="w-full gap-2">
                  Ver tienda
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
              </Link>
              <p className="relative mt-4 text-center text-sm text-neutral-500">
                ¿Ya lo tenés?{" "}
                <Link
                  href="/activar"
                  className="font-semibold text-violet-700 hover:underline"
                >
                  Activar código
                </Link>
              </p>
            </article>

            <article className="flex flex-col rounded-[2rem] border border-neutral-200 bg-white p-9 shadow-lg">
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-700">
                <QrCode className="h-3.5 w-3.5" aria-hidden />
                Digital gratis
              </p>
              <h3 className="mt-5 text-2xl font-black text-neutral-900 sm:text-3xl">
                Creás la cuenta e imprimís
              </h3>
              <p className="mt-3 text-neutral-600">
                Perfecto para probar o si preferís armar tu propio QR.
              </p>
              <ol className="mt-8 flex-1 space-y-5 text-neutral-700">
                {[
                  "Te registrás gratis (1 perfil incluido)",
                  "Completás los datos de contacto",
                  "Descargás PNG o imprimís PDF",
                ].map((item, i) => (
                  <li key={item} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-700">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{item}</span>
                  </li>
                ))}
              </ol>
              <Link href="/register" className="mt-10 block">
                <Button variant="secondary" size="lg" className="w-full">
                  Crear perfil gratis
                </Button>
              </Link>
              <p className="mt-4 text-center text-sm text-neutral-500">
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
        <section className="mx-auto max-w-[88rem] px-4 pb-28 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-900 px-6 py-20 text-center shadow-2xl shadow-violet-500/35 sm:px-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-25"
              aria-hidden
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
            <h2 className="relative text-3xl font-black text-white sm:text-5xl">
              Protegé lo que más importa hoy
            </h2>
            <p className="relative mx-auto mt-5 max-w-2xl text-lg text-violet-100 sm:text-xl">
              Creá tu perfil gratis en minutos o elegí un producto físico listo
              para activar.
            </p>
            <div className="relative mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white px-8 text-violet-700 shadow-xl hover:bg-violet-50"
                >
                  Empezar gratis
                </Button>
              </Link>
              <Link href="/tienda">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/30 bg-white/10 px-8 text-white hover:bg-white/20"
                >
                  Ver productos
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LegalFooter />
    </MarketingBackground>
  );
}
