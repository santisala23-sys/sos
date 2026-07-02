import Link from "next/link";
import type { Metadata } from "next";
import { Check, MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { Button } from "@/components/ui/Button";
import { FREE_PLAN, PLANS } from "@/lib/billing/plans";
import { buildWhatsAppUrl, buildRequestMoreProfilesMessage } from "@/lib/utils/contact";

export const metadata: Metadata = {
  title: "Planes y precios",
  description: "Empezá gratis con 1 QR. Pedí más perfiles o QR para productos contactando al equipo.",
};

const FREE_FEATURES = [
  "1 perfil QR (persona, mascota u objeto)",
  "Alertas push al escanear o SOS",
  "Ubicación opcional del escáner",
  "Chat en vivo por evento",
  "Descarga del QR para imprimir",
  "Contactos de emergencia e instrucciones",
] as const;

export default function PricingPage() {
  const whatsappMore = buildWhatsAppUrl(buildRequestMoreProfilesMessage({}));

  return (
    <div className="flex min-h-dvh flex-col bg-[#faf9fc]">
      <header className="border-b border-neutral-200/80 bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link href="/">
            <BrandLogo size="sm" />
          </Link>
          <Link href="/register" className="text-sm font-medium text-violet-700 hover:underline">
            Registrate gratis
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            Planes
          </p>
          <h1 className="mt-2 text-3xl font-black text-neutral-900 sm:text-4xl">
            Empezá gratis. Pedí más cuando lo necesites.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
            Por ahora no cobramos online: registrarte es gratis con{" "}
            <strong>un perfil QR</strong>. Si querés más perfiles o QR en productos
            físicos, contactanos y lo vemos juntos.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="relative rounded-3xl border-2 border-violet-400 bg-white p-8 shadow-lg shadow-violet-500/10">
            <span className="absolute -top-3 left-6 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Recomendado
            </span>
            <h2 className="text-2xl font-black text-neutral-900">{FREE_PLAN.name}</h2>
            <p className="mt-2 text-neutral-600">{FREE_PLAN.description}</p>
            <p className="mt-6">
              <span className="text-4xl font-black text-neutral-900">$0</span>
              <span className="text-neutral-500"> / siempre</span>
            </p>
            <ul className="mt-8 space-y-3">
              {FREE_FEATURES.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-neutral-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/register" className="mt-8 block">
              <Button size="lg" className="w-full">
                Registrate gratis
              </Button>
            </Link>
          </article>

          <article className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-black text-neutral-900">Más perfiles</h2>
            <p className="mt-2 text-neutral-600">
              Familia numerosa, varias mascotas, valijas, equipos — contanos qué
              necesitás y te ampliamos la cuenta.
            </p>
            <p className="mt-6 text-sm text-neutral-500">
              Precio a convenir · Sin tarjeta por ahora · Respuesta por WhatsApp
            </p>
            <ul className="mt-8 space-y-3 text-sm text-neutral-700">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
                Varios perfiles QR en una sola cuenta
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
                Mismo panel, alertas y chat para todos
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
                Ideal para probar en serio antes de pagos automáticos
              </li>
            </ul>
            <a
              href={whatsappMore}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block"
            >
              <Button variant="secondary" size="lg" className="w-full gap-2">
                <MessageCircle className="h-5 w-5" aria-hidden />
                Pedir más perfiles
              </Button>
            </a>
          </article>
        </div>

        <section className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold text-neutral-900">
            {PLANS.partner.name} — QR en ropa y productos
          </h2>
          <p className="mt-2 text-neutral-600">
            ¿Tenés una marca de ropa, accesorios o productos donde quieras una{" "}
            <strong>etiqueta con QR</strong>? Cada prenda puede llevar un código que el
            comprador activa al registrarse.{" "}
            <Link href="/productos" className="font-semibold text-violet-700 hover:underline">
              Ver cómo funciona
            </Link>
            .
          </p>
        </section>

        <p className="mt-8 text-center text-sm text-neutral-500">
          Cuando activemos pagos online, avisaremos con tiempo y respetaremos a quienes
          ya usen SOSme gratis.
        </p>
      </main>

      <LegalFooter />
    </div>
  );
}
