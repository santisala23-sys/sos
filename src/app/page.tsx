import Image from "next/image";
import Link from "next/link";
import { LegalFooter } from "@/components/legal/LegalFooter";
import {
  ArrowRight,
  Check,
  Package,
  QrCode,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";

const USE_CASES = [
  {
    title: "Personas",
    description: "Contacto de emergencia, alergias e instrucciones si hace falta ayuda.",
    accent: "from-rose-500/15 to-orange-500/10",
    image: "/images/landing/use-case-personas.png",
    imageAlt: "Tarjeta con código QR guardada en el bolsillo de una chaqueta",
  },
  {
    title: "Mascotas",
    description: "Collar o chapita con QR: quien la encuentre te llama al instante.",
    accent: "from-amber-500/15 to-yellow-500/10",
    image: "/images/landing/use-case-mascotas.png",
    imageAlt: "Perro con collar y chapita que muestra un código QR",
  },
  {
    title: "Objetos y valijas",
    description: "Si alguien encuentra tu valija o notebook, sabe cómo avisarte.",
    accent: "from-sky-500/15 to-indigo-500/10",
    image: "/images/landing/use-case-valijas.png",
    imageAlt: "Valija de viaje con un sticker de código QR en el aeropuerto",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Escanean el QR",
    text: "Con la cámara del celular. Sin instalar ninguna app.",
    image: "/images/landing/screenshots/scan-location.png",
    imageAlt: "Celular escaneando un QR SOSme",
  },
  {
    step: "2",
    title: "Ven cómo contactarte",
    text: "WhatsApp, llamada y ubicación en el mapa.",
    image: "/images/landing/screenshots/public-profile.png",
    imageAlt: "Perfil público con contactos de emergencia",
  },
  {
    step: "3",
    title: "Vos recibís la alerta",
    text: "Notificación en el celular cuando alguien escanea.",
    image: "/images/landing/screenshots/push-alert.png",
    imageAlt: "Notificación push de alerta SOSme",
  },
] as const;

const INCLUDES = [
  "Perfil online con tus datos de contacto",
  "WhatsApp y llamada al instante",
  "Ubicación cuando escanean (opcional)",
  "Alerta en tu celular",
  "Sin apps: funciona en el navegador",
  "Sin cuotas mensuales",
] as const;

export default function HomePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#faf9fc] text-neutral-900">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-rose-100/60 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/75 px-4 py-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <BrandLogo size="md" />
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/tienda" className="hidden text-sm font-medium text-neutral-600 hover:text-violet-700 md:inline">
              Tienda
            </Link>
            <Link href="/pricing" className="hidden text-sm font-medium text-neutral-600 hover:text-violet-700 sm:inline">
              Planes
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Ingresar
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                Empezar gratis
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-4 py-1.5 text-sm font-medium text-violet-800 shadow-sm backdrop-blur-sm">
                <QrCode className="h-4 w-4" aria-hidden />
                Sin instalar apps
              </p>
              <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                Escanean tu QR y{" "}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  saben cómo ayudarte
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 sm:text-xl lg:mx-0">
                Para personas, mascotas o valijas. Quien encuentra el QR te contacta
                al instante. Vos recibís la alerta en el celular.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link href="/tienda">
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 px-8 shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
                  >
                    Ver productos
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary" size="lg">
                    Crear gratis e imprimir
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/60 shadow-xl shadow-violet-500/15 backdrop-blur-sm">
                <Image
                  src="/images/landing/hero-scan.png"
                  alt="Persona mostrando su tarjeta QR mientras alguien la escanea con el celular"
                  width={1024}
                  height={1024}
                  priority
                  className="h-auto w-full"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-3">
            {USE_CASES.map(({ title, description, accent, image, imageAlt }) => (
              <article
                key={title}
                className={`overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br ${accent} shadow-sm backdrop-blur-sm`}
              >
                <div className="relative aspect-square overflow-hidden bg-white/50">
                  <Image
                    src={image}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-neutral-200/80 bg-white px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
                Cómo funciona
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
                Así de simple
              </h2>
              <p className="mt-4 text-lg text-neutral-600">
                Tres pasos. Sin instalar nada.
              </p>
            </div>

            <ol className="mt-14 grid gap-10 sm:grid-cols-3">
              {HOW_IT_WORKS.map(({ step, title, text, image, imageAlt }) => (
                <li key={step} className="flex flex-col text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-xl font-black text-white">
                    {step}
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-neutral-900">{title}</h3>
                  <p className="mt-2 text-neutral-600">{text}</p>
                  <div className="mx-auto mt-6 w-full max-w-[220px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg shadow-violet-500/10">
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

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid items-center gap-10 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm lg:grid-cols-2 lg:p-12">
            <div>
              <h2 className="text-2xl font-black text-neutral-900 sm:text-3xl">
                Qué incluye
              </h2>
              <p className="mt-3 text-neutral-600">
                Todo lo que necesitás para que te encuentren y te avisen.
              </p>
              <ul className="mt-8 space-y-3">
                {INCLUDES.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-neutral-800">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50">
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
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8 pb-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-neutral-900">
              Elegí cómo empezar
            </h2>
            <p className="mt-3 text-neutral-600">
              Comprás el producto y lo activás una vez, o te creás la cuenta y lo imprimís vos.
            </p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="flex flex-col rounded-3xl border-2 border-violet-300 bg-white p-8 shadow-lg shadow-violet-500/10">
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-800">
                <Package className="h-3.5 w-3.5" aria-hidden />
                Producto físico
              </p>
              <h3 className="mt-4 text-2xl font-black text-neutral-900">
                Comprás y activás una vez
              </h3>
              <ol className="mt-6 flex-1 space-y-3 text-neutral-700">
                <li className="flex gap-3">
                  <span className="font-black text-violet-600">1.</span>
                  Pedís el collar, colgante o credencial
                </li>
                <li className="flex gap-3">
                  <span className="font-black text-violet-600">2.</span>
                  Escaneás el QR una sola vez y te registrás
                </li>
                <li className="flex gap-3">
                  <span className="font-black text-violet-600">3.</span>
                  Listo: queda vinculado a tu perfil
                </li>
              </ol>
              <Link href="/tienda" className="mt-8 block">
                <Button size="lg" className="w-full gap-2">
                  Ver tienda
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
              </Link>
              <p className="mt-3 text-center text-sm text-neutral-500">
                ¿Ya lo tenés?{" "}
                <Link href="/activar" className="font-medium text-violet-700 hover:underline">
                  Activar código
                </Link>
              </p>
            </article>

            <article className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neutral-700">
                <QrCode className="h-3.5 w-3.5" aria-hidden />
                Digital gratis
              </p>
              <h3 className="mt-4 text-2xl font-black text-neutral-900">
                Creás la cuenta e imprimís
              </h3>
              <ol className="mt-6 flex-1 space-y-3 text-neutral-700">
                <li className="flex gap-3">
                  <span className="font-black text-violet-600">1.</span>
                  Te registrás gratis (1 perfil)
                </li>
                <li className="flex gap-3">
                  <span className="font-black text-violet-600">2.</span>
                  Completás los datos de contacto
                </li>
                <li className="flex gap-3">
                  <span className="font-black text-violet-600">3.</span>
                  Descargás PNG o imprimís PDF
                </li>
              </ol>
              <Link href="/register" className="mt-8 block">
                <Button variant="secondary" size="lg" className="w-full">
                  Crear perfil gratis
                </Button>
              </Link>
              <p className="mt-3 text-center text-sm text-neutral-500">
                ¿Necesitás más de 1?{" "}
                <Link href="/pricing" className="font-medium text-violet-700 hover:underline">
                  Pedí más perfiles
                </Link>
              </p>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 px-6 py-14 text-center shadow-xl shadow-violet-500/30 sm:px-12">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Empezá hoy
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-violet-100">
              Comprá el producto o creá tu perfil gratis e imprimí el QR.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/tienda" className="inline-block">
                <Button
                  size="lg"
                  className="bg-white text-violet-700 shadow-lg hover:bg-violet-50"
                >
                  Ver productos
                </Button>
              </Link>
              <Link href="/register" className="inline-block">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  Crear gratis e imprimir
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
