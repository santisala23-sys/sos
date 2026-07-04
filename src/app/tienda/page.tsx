import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LegalFooter } from "@/components/legal/LegalFooter";
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
    text: "Collar, colgante, credencial, imán o sticker con QR.",
  },
  {
    step: "2",
    title: "Escaneás una vez",
    text: "Te registrás y vinculás el código a tu perfil.",
  },
  {
    step: "3",
    title: "Listo",
    text: "Quien escanee después ve cómo contactarte. Vos recibís la alerta.",
  },
] as const;

const INCLUDES = [
  "Producto físico con QR único",
  "Perfil online con tus contactos",
  "WhatsApp y llamada al instante",
  "Alerta en tu celular al escanear",
  "Ubicación opcional en el mapa",
  "Sin apps ni cuotas mensuales",
] as const;

export default async function TiendaPage() {
  let products: Awaited<ReturnType<typeof listActiveStoreProducts>> = [];
  try {
    products = await listActiveStoreProducts();
  } catch {
    products = [];
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#faf9fc]">
      <header className="border-b border-neutral-200/80 bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/">
            <BrandLogo size="sm" />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/activar" className="text-neutral-600 hover:text-violet-700">
              Activar código
            </Link>
            <Link href="/register" className="font-medium text-violet-700 hover:underline">
              QR gratis
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            Tienda
          </p>
          <h1 className="mt-2 text-3xl font-black text-neutral-900 sm:text-4xl">
            El accesorio con QR para lo que más importa
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Comprás, escaneás una vez y queda registrado. Quien lo encuentre te contacta —
            sin instalar nada.
          </p>
        </div>

        <section className="mt-12">
          <h2 className="text-center text-xl font-bold text-neutral-900">
            Cómo funciona
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, text }) => (
              <li
                key={step}
                className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm"
              >
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-lg font-black text-white">
                  {step}
                </span>
                <h3 className="mt-4 font-bold text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-center text-sm text-neutral-500">
            ¿Ya compraste?{" "}
            <Link href="/activar" className="font-semibold text-violet-700 hover:underline">
              Activá tu código acá
            </Link>
          </p>
        </section>

        <section id="catalogo" className="mt-16 scroll-mt-24">
          <h2 className="text-2xl font-black text-neutral-900">Elegí el tuyo</h2>
          <p className="mt-2 text-neutral-600">
            Sumá al pedido y completá tus datos. Te contactamos para pago y envío.
          </p>
          <div className="mt-8">
            {products.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
                <p className="text-neutral-600">
                  El catálogo se está preparando.{" "}
                  <Link href="/contacto" className="font-semibold text-violet-700 hover:underline">
                    Escribinos
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <StoreCheckout products={products} />
            )}
          </div>
        </section>

        <section className="mt-16 grid gap-8 rounded-3xl border border-neutral-200 bg-white p-8 lg:grid-cols-2 lg:p-10">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Qué incluye</h2>
            <ul className="mt-6 space-y-3">
              {INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-neutral-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-violet-50 p-6">
            <h2 className="text-xl font-bold text-neutral-900">
              ¿Preferís imprimirlo vos?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700">
              Creá tu cuenta gratis, configurá el perfil y descargá el QR en PNG o PDF.
            </p>
            <Link href="/register" className="mt-5 inline-block">
              <Button variant="secondary">Crear perfil gratis</Button>
            </Link>
          </div>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}
