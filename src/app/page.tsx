import Image from "next/image";
import Link from "next/link";
import { LegalFooter } from "@/components/legal/LegalFooter";
import {
  ArrowRight,
  Bell,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  QrCode,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";

const USE_CASES = [
  {
    title: "Personas",
    description:
      "Asistencia, alergias, datos médicos y contactos de emergencia para situaciones de estrés.",
    accent: "from-rose-500/15 to-orange-500/10",
    image: "/images/landing/use-case-personas.png",
    imageAlt: "Tarjeta con código QR guardada en el bolsillo de una chaqueta",
  },
  {
    title: "Mascotas",
    description:
      "Collar o chapita con QR: quien la encuentre llama al dueño al instante.",
    accent: "from-amber-500/15 to-yellow-500/10",
    image: "/images/landing/use-case-mascotas.png",
    imageAlt: "Perro con collar y chapita que muestra un código QR",
  },
  {
    title: "Objetos y valijas",
    description:
      "Notebook, equipaje o billetera: instrucciones claras y contacto si alguien lo encuentra.",
    accent: "from-sky-500/15 to-indigo-500/10",
    image: "/images/landing/use-case-valijas.png",
    imageAlt: "Valija de viaje con un sticker de código QR en el aeropuerto",
  },
] as const;

const FEATURES = [
  {
    icon: QrCode,
    title: "QR listo para imprimir",
    text: "Descargá el código en PNG y pegalo donde quieras: credencial, collar, valija o sticker.",
  },
  {
    icon: Phone,
    title: "Llamada y WhatsApp",
    text: "Un toque para contactar a la familia o al dueño, con mensaje de emergencia prearmado.",
  },
  {
    icon: MapPin,
    title: "Ubicación al escanear",
    text: "Quien abre el QR puede compartir dónde está. Vos recibís el aviso en el mapa.",
  },
  {
    icon: Bell,
    title: "Alertas push",
    text: "Notificación al celular cuando escanean el QR, activan SOS o escriben un mensaje.",
  },
  {
    icon: MessageCircle,
    title: "Chat en vivo",
    text: "Conversación entre quien está en el lugar y la familia, desde el panel.",
  },
  {
    icon: Sparkles,
    title: "Modo solo SOS",
    text: "Link directo con pantalla mínima para pedir ayuda con un solo botón.",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Escanean tu QR",
    text: "Quien encuentra la mascota, valija o credencial abre el perfil y puede compartir ubicación al instante.",
    image: "/images/landing/screenshots/scan-location.png",
    imageAlt: "Pantalla de SOSme con mensaje de gracias por ayudar y botón para compartir ubicación",
  },
  {
    step: "2",
    title: "Contactan al instante",
    text: "Llamada, WhatsApp y chat en vivo desde la pantalla pública — sin instalar nada.",
    image: "/images/landing/screenshots/public-profile.png",
    imageAlt: "Perfil público de SOSme con contactos de emergencia y conversación en vivo",
  },
  {
    step: "3",
    title: "Seguís todo en el panel",
    text: "Mapa, mensajes y detalle del escaneo en tiempo real desde tu celular.",
    image: "/images/landing/screenshots/live-chat-map.png",
    imageAlt: "Panel de SOSme con conversación en vivo y mapa de ubicación",
  },
  {
    step: "4",
    title: "Recibís la alerta",
    text: "Notificación push al celular cuando hay escaneo, mensaje o ubicación — un toque y entrás.",
    image: "/images/landing/screenshots/push-alert.png",
    imageAlt: "Notificación push de SOSme con alerta de ubicación de Firu",
  },
] as const;

const STEPS = [
  {
    step: "01",
    title: "Creás tu perfil",
    text: "Elegís si es persona, mascota u objeto. Completás contactos e instrucciones en minutos.",
  },
  {
    step: "02",
    title: "Imprimís o pedís el QR",
    text: "Descargá el PNG gratis o pedí collar, colgante, credencial o imán en la tienda.",
  },
  {
    step: "03",
    title: "Listo para el mundo",
    text: "Quien escanea ve qué hacer y te alerta. Vos seguís todo desde el panel en el celular.",
  },
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
            <Link href="/pricing" className="hidden text-sm font-medium text-neutral-600 hover:text-violet-700 sm:inline">
              Planes
            </Link>
            <Link href="/tienda" className="hidden text-sm font-medium text-neutral-600 hover:text-violet-700 md:inline">
              Tienda
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
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-4 py-1.5 text-sm font-medium text-violet-800 shadow-sm backdrop-blur-sm">
                <QrCode className="h-4 w-4" aria-hidden />
                Tu QR personal, para lo que más importa
              </p>
              <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight text-neutral-900 sm:text-6xl">
                Cuando alguien escanea,{" "}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  sabe cómo ayudarte
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 sm:text-xl lg:mx-0">
                <BrandLogo href="" size="sm" className="align-baseline" /> conecta
                al instante a quien encuentra tu QR con vos: familia, dueño o
                contacto de confianza. Personas, mascotas, valijas, equipos — lo
                que necesites proteger.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link href="/tienda">
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 px-8 shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
                  >
                    Comprar producto con QR
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary" size="lg">
                    Crear gratis e imprimir
                  </Button>
                </Link>
              </div>
              <p className="mt-5 text-sm text-neutral-500">
                Sin instalar apps · Escaneás una vez y registrás · O descargás PNG/PDF vos
              </p>
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

          <div className="mx-auto mt-20 grid max-w-5xl gap-6 sm:grid-cols-3">
            {USE_CASES.map(({ title, description, accent, image, imageAlt }) => (
              <article
                key={title}
                className={`overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br ${accent} shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md`}
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

        <section className="border-y border-neutral-200/80 bg-white/60 px-4 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
                Así funciona
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
                De un escaneo a una alerta en segundos
              </h2>
              <p className="mt-4 text-neutral-600">
                Probado en la calle: ubicación, chat y notificación push en un solo flujo.
              </p>
            </div>
            <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map(({ step, title, text, image, imageAlt }) => (
                <li key={step} className="flex flex-col">
                  <h3 className="text-lg font-bold text-neutral-900">
                    <span className="text-violet-600">{step}</span>
                    <span className="mx-2 text-neutral-300" aria-hidden>
                      —
                    </span>
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {text}
                  </p>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-lg shadow-violet-500/10">
                    <Image
                      src={image}
                      alt={imageAlt}
                      width={390}
                      height={844}
                      className="h-auto w-full"
                      sizes="(max-width: 1024px) 100vw, 25vw"
                    />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-y border-neutral-200/80 bg-white/60 px-4 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
                Simple de configurar, potente cuando hace falta
              </h2>
              <p className="mt-4 text-neutral-600">
                Pensado para familias, dueños de mascotas y cualquiera que quiera
                un plan B en el bolsillo — o en la valija.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-bold text-neutral-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
              Tres pasos y ya estás cubierto
            </h2>
          </div>
          <ol className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-3">
            {STEPS.map(({ step, title, text }) => (
              <li key={step} className="relative text-center sm:text-left">
                <span className="text-5xl font-black text-violet-100">{step}</span>
                <h3 className="mt-2 text-lg font-bold text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
              Dos formas de tener tu QR
            </h2>
            <p className="mt-4 text-neutral-600">
              Como en los accesorios inteligentes: comprás el producto y lo activás una vez,
              o te creás la cuenta y lo imprimís vos.
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
              <p className="mt-3 flex-1 text-neutral-600">
                Collar, colgante, credencial, imán o sticker con QR único. Escaneás,
                te registrás y queda vinculado a tu perfil. Quien lo encuentre ve
                contacto y te avisa — sin instalar apps.
              </p>
              <ol className="mt-6 space-y-2 text-sm text-neutral-700">
                <li>
                  <strong className="text-violet-700">1.</strong> Pedís el producto en la tienda
                </li>
                <li>
                  <strong className="text-violet-700">2.</strong> Escaneás el QR una sola vez
                </li>
                <li>
                  <strong className="text-violet-700">3.</strong> Completás el perfil y listo
                </li>
              </ol>
              <Link href="/tienda" className="mt-8 block">
                <Button size="lg" className="w-full gap-2">
                  Ver tienda
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
              </Link>
              <p className="mt-3 text-center text-xs text-neutral-500">
                ¿Ya lo compraste?{" "}
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
              <p className="mt-3 flex-1 text-neutral-600">
                1 perfil gratis. Configurás persona, mascota u objeto y descargás el QR en
                PNG o PDF para imprimir, plastificar o pegar donde quieras.
              </p>
              <ol className="mt-6 space-y-2 text-sm text-neutral-700">
                <li>
                  <strong className="text-violet-700">1.</strong> Te registrás gratis
                </li>
                <li>
                  <strong className="text-violet-700">2.</strong> Completás el perfil
                </li>
                <li>
                  <strong className="text-violet-700">3.</strong> Descargás PNG o imprimís PDF
                </li>
              </ol>
              <Link href="/register" className="mt-8 block">
                <Button variant="secondary" size="lg" className="w-full">
                  Crear perfil gratis
                </Button>
              </Link>
              <p className="mt-3 text-center text-xs text-neutral-500">
                ¿Necesitás más de 1 QR?{" "}
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
              Tu QR, tu manera. Empezá hoy.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-violet-100">
              Comprá el accesorio y activá una vez, o creá tu perfil gratis e imprimí el QR.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/tienda" className="inline-block">
                <Button
                  size="lg"
                  className="bg-white text-violet-700 shadow-lg hover:bg-violet-50"
                >
                  Comprar producto
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
