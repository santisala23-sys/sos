import Link from "next/link";
import type { Metadata } from "next";
import { Bell, Check, MapPin, QrCode, Smartphone, Truck } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { StoreCheckout } from "@/components/store/StoreCheckout";
import { Button } from "@/components/ui/Button";
import { listActiveStoreProducts } from "@/lib/db/queries-store";

export const metadata: Metadata = {
  title: "Tienda SOSme — Collares, colgantes, credenciales con QR",
  description:
    "Comprá productos con QR de emergencia. Escaneás una vez, te registrás y listo. Sin instalar apps.",
};

export const dynamic = "force-dynamic";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Comprás el producto",
    text: "Collar, colgante, imán, credencial o sticker con QR único incluido.",
  },
  {
    step: "2",
    title: "Escaneás una sola vez",
    text: "Abrís el link de activación, creás tu cuenta y vinculás el código a tu perfil.",
  },
  {
    step: "3",
    title: "Queda registrado",
    text: "Quien encuentre a tu mascota, persona o valija ve contacto, instrucciones y puede avisar.",
  },
] as const;

const INCLUDES = [
  "Producto físico con QR único",
  "Perfil online (persona, mascota u objeto)",
  "Alertas push cuando escanean",
  "Ubicación opcional del escaneo",
  "WhatsApp y llamada al contacto",
  "Sin app: funciona desde el navegador",
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
              QR gratis (imprimí vos)
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            Tienda
          </p>
          <h1 className="mt-2 text-3xl font-black text-neutral-900 sm:text-4xl">
            El accesorio con QR para lo que más importa
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Comprás el producto, escaneás una vez, te registrás y listo. Quien encuentre a
            tu mascota, persona o valija sabe cómo contactarte — sin instalar nada.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden />
            <p className="text-sm text-neutral-700">
              <strong>Activación única:</strong> escaneás el QR del producto y lo vinculás a
              tu cuenta.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" aria-hidden />
            <p className="text-sm text-neutral-600">
              Recibís alerta y ubicación cuando alguien escanea.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" aria-hidden />
            <p className="text-sm text-neutral-600">
              Pedido por la web; coordinamos pago y envío por WhatsApp.
            </p>
          </div>
        </div>

        <section id="catalogo" className="mt-14 scroll-mt-24">
          <h2 className="text-2xl font-black text-neutral-900">Elegí el tuyo</h2>
          <p className="mt-2 text-neutral-600">
            Sumá al pedido y completá tus datos. Te contactamos para cerrar.
          </p>
          <div className="mt-8">
            {products.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
                <p className="text-neutral-600">
                  El catálogo se está preparando. Volvé pronto o{" "}
                  <Link href="/contacto" className="font-semibold text-violet-700 hover:underline">
                    escribinos
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <StoreCheckout products={products} />
            )}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-center text-2xl font-black text-neutral-900">
            ¿Cómo funciona?
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, text }) => (
              <li
                key={step}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <span className="text-3xl font-black text-violet-200">{step}</span>
                <h3 className="mt-2 font-bold text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-center text-sm text-neutral-500">
            ¿Ya tenés el producto?{" "}
            <Link href="/activar" className="font-semibold text-violet-700 hover:underline">
              Activá tu código acá
            </Link>
          </p>
        </section>

        <section className="mt-16 grid gap-8 rounded-3xl border border-neutral-200 bg-white p-8 lg:grid-cols-2 lg:p-10">
          <div>
            <div className="flex items-center gap-2 text-violet-700">
              <QrCode className="h-5 w-5" aria-hidden />
              <h2 className="text-xl font-bold text-neutral-900">Qué incluye</h2>
            </div>
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
            <div className="flex items-center gap-2 text-violet-800">
              <MapPin className="h-5 w-5" aria-hidden />
              <h2 className="text-xl font-bold">¿Preferís imprimirlo vos?</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700">
              Creá tu cuenta gratis (1 perfil), configurá los datos y descargá el QR en{" "}
              <strong>PNG</strong> o <strong>PDF</strong> para imprimir, plastificar o pegar
              donde quieras.
            </p>
            <Link href="/register" className="mt-5 inline-block">
              <Button variant="secondary">Crear perfil gratis e imprimir</Button>
            </Link>
          </div>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}
