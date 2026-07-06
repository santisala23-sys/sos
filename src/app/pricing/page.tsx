import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Check,
  MessageCircle,
  Package,
  QrCode,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { Button } from "@/components/ui/Button";
import { FREE_PLAN } from "@/lib/billing/plans";
import {
  buildWhatsAppUrl,
  buildRequestMoreProfilesMessage,
} from "@/lib/utils/contact";

export const metadata: Metadata = {
  title: "Planes y precios",
  description:
    "1 QR gratis por familia. Más perfiles por contacto. Productos físicos en la tienda.",
};

const FREE_FEATURES = [
  "1 perfil QR (persona, mascota u objeto)",
  "Alertas push al escanear o SOS",
  "Ubicación opcional del escáner",
  "Chat en vivo por evento",
  "Descarga del QR para imprimir",
  "Contactos de emergencia e instrucciones",
] as const;

const MORE_FEATURES = [
  "Varios perfiles en una sola cuenta",
  "Mismo panel y alertas para todos",
  "Ideal antes de activar pagos automáticos",
] as const;

export default function PricingPage() {
  const whatsappMore = buildWhatsAppUrl(buildRequestMoreProfilesMessage({}));

  return (
    <MarketingBackground>
      <MarketingNavbar variant="subpage" />

      <main>
        <section className="mx-auto max-w-[88rem] px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/90 px-4 py-2 text-sm font-semibold text-violet-800 shadow-sm">
              <Sparkles className="h-4 w-4 text-violet-600" aria-hidden />
              Planes y precios
            </p>
            <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl">
              Simple:{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                1 QR gratis
              </span>{" "}
              o producto físico
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 sm:text-xl">
              Creá tu perfil gratis e imprimí el QR (PNG/PDF), o comprá un
              producto en la{" "}
              <Link
                href="/tienda"
                className="font-semibold text-violet-700 hover:underline"
              >
                tienda
              </Link>{" "}
              y activá el código una sola vez. Si necesitás varios perfiles,
              escribinos.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-2">
            <article className="relative flex flex-col overflow-hidden rounded-[2rem] border-2 border-violet-400 bg-white p-9 shadow-2xl shadow-violet-500/15">
              <span className="absolute right-6 top-6 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                Recomendado
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <QrCode className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="mt-6 text-3xl font-black text-neutral-900">
                {FREE_PLAN.name}
              </h2>
              <p className="mt-3 text-neutral-600">{FREE_PLAN.description}</p>
              <p className="mt-8">
                <span className="text-5xl font-black text-neutral-900">$0</span>
                <span className="text-lg text-neutral-500"> / siempre</span>
              </p>
              <ul className="mt-8 flex-1 space-y-4">
                {FREE_FEATURES.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm font-medium text-neutral-700"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100">
                      <Check
                        className="h-3.5 w-3.5 text-violet-700"
                        aria-hidden
                      />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-10 block">
                <Button size="lg" className="w-full gap-2">
                  Registrate gratis
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
              </Link>
            </article>

            <article className="flex flex-col rounded-[2rem] border border-neutral-200 bg-white p-9 shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">
                <MessageCircle className="h-6 w-6" aria-hidden />
              </div>
              <h2 className="mt-6 text-3xl font-black text-neutral-900">
                Más perfiles
              </h2>
              <p className="mt-3 text-neutral-600">
                ¿Tu familia necesita 3, 5 o más QR? Contanos y ampliamos tu
                cuenta manualmente.
              </p>
              <p className="mt-8 rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                Precio a convenir · Sin tarjeta por ahora · Respuesta por
                WhatsApp
              </p>
              <ul className="mt-8 flex-1 space-y-4">
                {MORE_FEATURES.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm font-medium text-neutral-700"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                      <Check
                        className="h-3.5 w-3.5 text-neutral-500"
                        aria-hidden
                      />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={whatsappMore}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 block"
              >
                <Button variant="secondary" size="lg" className="w-full gap-2">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  Pedir más perfiles
                </Button>
              </a>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-[88rem] px-4 pb-28 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2.5rem] border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50/60 p-8 shadow-xl shadow-violet-500/8 sm:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <ShoppingBag className="h-6 w-6" aria-hidden />
                </div>
                <h2 className="mt-5 text-2xl font-black text-neutral-900 sm:text-3xl">
                  Productos físicos con QR
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-neutral-600">
                  Comprás el accesorio, escaneás una vez, te registrás y queda
                  vinculado. Pedí desde la tienda; coordinamos pago y envío por
                  WhatsApp.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:shrink-0">
                <Link href="/tienda">
                  <Button size="lg" className="gap-2">
                    <Package className="h-5 w-5" aria-hidden />
                    Ir a la tienda
                  </Button>
                </Link>
                <Link href="/activar">
                  <Button variant="secondary" size="lg">
                    Activar código
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Pagos online en la tienda: próximamente. Por ahora pedidos manuales
            con respuesta rápida.
          </p>
        </section>
      </main>

      <LegalFooter />
    </MarketingBackground>
  );
}
