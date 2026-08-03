import Link from "next/link";
import { Package } from "lucide-react";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { StoreCheckout } from "@/components/store/StoreCheckout";
import { Button } from "@/components/ui/Button";
import { listActiveStoreProducts } from "@/lib/db/queries-store";

export async function StoreCatalogSection() {
  let products: Awaited<ReturnType<typeof listActiveStoreProducts>> = [];
  try {
    products = await listActiveStoreProducts();
  } catch {
    products = [];
  }

  return (
    <section
      id="catalogo"
      className="scroll-mt-32 border-y border-violet-100/80 bg-white/60 px-4 py-24 backdrop-blur-sm sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            align="left"
            eyebrow="Catálogo"
            title="Elegí tu producto con QR"
            description="Sumá al carrito y contactanos por WhatsApp para coordinar pago y envío."
          />
          <Link
            href="/register"
            className="shrink-0 text-sm font-semibold text-violet-700 hover:underline"
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
      </div>
    </section>
  );
}
