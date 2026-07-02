import Link from "next/link";
import type { Metadata } from "next";
import { QrCode, Truck } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { StoreCheckout } from "@/components/store/StoreCheckout";
import { listActiveStoreProducts } from "@/lib/db/queries-store";

export const metadata: Metadata = {
  title: "Tienda SOSme — Collares, colgantes, credenciales con QR",
  description:
    "Pedí productos físicos con QR de emergencia: collares, colgantes, imanes, credenciales plastificadas y stickers.",
};

export const dynamic = "force-dynamic";

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
            <Link href="/pricing" className="text-neutral-600 hover:text-violet-700">
              Planes
            </Link>
            <Link href="/register" className="font-medium text-violet-700 hover:underline">
              QR gratis
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
            Productos con QR listos para usar
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Collares, colgantes, imanes, credenciales y stickers con tu QR SOSme incluido.
            Armá el pedido acá — te contactamos para precio, pago y envío.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
            <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden />
            <p className="text-sm text-neutral-700">
              <strong>1 QR gratis</strong> al registrarte. ¿Necesitás más perfiles para la
              familia?{" "}
              <Link href="/contacto" className="font-semibold text-violet-700 hover:underline">
                Contactanos
              </Link>
              .
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" aria-hidden />
            <p className="text-sm text-neutral-600">
              Sin checkout online todavía: enviás el pedido y coordinamos por WhatsApp o email.
            </p>
          </div>
        </div>

        <div className="mt-12">
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
      </main>

      <LegalFooter />
    </div>
  );
}
