import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Bell,
  MapPin,
  MessageCircle,
  Package,
  QrCode,
  ScanLine,
  Shield,
  Smartphone,
} from "lucide-react";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { StoreCheckout } from "@/components/store/StoreCheckout";
import { Button } from "@/components/ui/Button";
import { listActiveStoreProducts } from "@/lib/db/queries-store";

export const metadata: Metadata = {
  title: "Tienda SOSme — Collares, colgantes, credenciales con QR",
  description:
    "Comprá el producto, escaneá una vez y registralo. Sin instalar apps.",
};

export const dynamic = "force-dynamic";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Comprás el producto",
    text: "Collar, colgante, credencial, imán o sticker con QR único.",
    icon: Package,
  },
  {
    step: "2",
    title: "Escaneás una vez",
    text: "Te registrás y vinculás el código a tu perfil de emergencia.",
    icon: ScanLine,
  },
  {
    step: "3",
    title: "Listo para siempre",
    text: "Quien escanee ve cómo contactarte. Vos recibís la alerta al instante.",
    icon: Bell,
  },
] as const;

const INCLUDES = [
  { icon: QrCode, text: "Producto físico con QR único" },
  { icon: MessageCircle, text: "WhatsApp y llamada al instante" },
  { icon: Bell, text: "Alerta en tu celular al escanear" },
  { icon: MapPin, text: "Ubicación opcional en el mapa" },
  { icon: Smartphone, text: "Sin apps ni cuotas mensuales" },
  { icon: Shield, text: "Perfil online con tus contactos" },
] as const;

export default async function TiendaPage() {
  let products: Awaited<ReturnType<typeof listActiveStoreProducts>> = [];
  try {
    products = await listActiveStoreProducts();
  } catch {
    products = [];
  }

  return (
    <MarketingBackground>
      <MarketingNavbar variant="subpage" />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-[88rem] px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-4 py-1.5 text-sm font-semibold text-violet-800 shadow-sm">
              <Package className="h-4 w-4" aria-hidden />
              Productos físicos con QR
            </p>
            <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl">
              El accesorio con QR para{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                lo que más importa
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-600 sm:text-xl">
              Comprás collar, chapita, credencial o sticker. Lo escaneás una sola
              vez, lo vinculás a tu perfil y queda listo. Quien lo encuentre te
              contacta sin instalar nada.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#catalogo">
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 px-8 shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
                >
                  Ver catálogo
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
              </a>
              <Link href="/activar">
                <Button variant="secondary" size="lg">
                  Ya tengo un código
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="border-y border-violet-100/80 bg-white/60 px-4 py-16 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
                Cómo funciona
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-neutral-900">
                Comprás, activás una vez y listo
              </h2>
            </div>

            <ol className="mt-12 grid gap-6 sm:grid-cols-3">
              {HOW_IT_WORKS.map(({ step, title, text, icon: Icon }) => (
                <li
                  key={step}
                  className="relative rounded-3xl border border-violet-100 bg-gradient-to-b from-white to-violet-50/30 p-7 text-center shadow-sm"
                >
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-lg font-black text-white shadow-lg shadow-violet-500/20">
                    {step}
                  </span>
                  <div className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-neutral-900">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {text}
                  </p>
                </li>
              ))}
            </ol>

            <p className="mt-8 text-center text-sm text-neutral-500">
              ¿Ya compraste?{" "}
              <Link
                href="/activar"
                className="font-semibold text-violet-700 hover:underline"
              >
                Activá tu código acá
              </Link>
            </p>
          </div>
        </section>

        {/* Catálogo */}
        <section id="catalogo" className="scroll-mt-32 mx-auto max-w-6xl px-4 py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
                Catálogo
              </p>
              <h2 className="mt-2 text-3xl font-black text-neutral-900">
                Elegí el tuyo
              </h2>
              <p className="mt-2 max-w-xl text-neutral-600">
                Sumá al pedido y completá tus datos. Te contactamos para
                coordinar pago y envío.
              </p>
            </div>
            <Link
              href="/register"
              className="text-sm font-semibold text-violet-700 hover:underline"
            >
              ¿Preferís imprimir el QR gratis? →
            </Link>
          </div>

          <div className="mt-10">
            {products.length === 0 ? (
              <div className="rounded-3xl border border-violet-100 bg-white p-12 text-center shadow-sm">
                <Package className="mx-auto h-12 w-12 text-violet-400" aria-hidden />
                <p className="mt-4 text-lg font-medium text-neutral-800">
                  El catálogo se está preparando
                </p>
                <p className="mt-2 text-neutral-600">
                  Mientras tanto podés crear tu perfil digital gratis.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/contacto">
                    <Button variant="secondary">Escribinos</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Crear perfil gratis</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <StoreCheckout products={products} />
            )}
          </div>
        </section>

        {/* Qué incluye */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="overflow-hidden rounded-[2rem] border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50/50 p-8 shadow-xl shadow-violet-500/5 lg:grid lg:grid-cols-2 lg:gap-12 lg:p-12">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-violet-600">
                Todo incluido
              </p>
              <h2 className="mt-3 text-2xl font-black text-neutral-900 sm:text-3xl">
                Cada producto trae el sistema completo
              </h2>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
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

            <div className="mt-8 flex flex-col justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white lg:mt-0">
              <QrCode className="h-10 w-10 text-violet-200" aria-hidden />
              <h3 className="mt-4 text-2xl font-black">
                ¿Preferís imprimirlo vos?
              </h3>
              <p className="mt-3 leading-relaxed text-violet-100">
                Creá tu cuenta gratis, configurá el perfil y descargá el QR en
                PNG o PDF. Ideal si querés probar antes de comprar.
              </p>
              <Link href="/register" className="mt-6">
                <Button
                  size="lg"
                  className="w-full bg-white text-violet-700 shadow-lg hover:bg-violet-50 sm:w-auto"
                >
                  Crear perfil gratis
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </MarketingBackground>
  );
}
