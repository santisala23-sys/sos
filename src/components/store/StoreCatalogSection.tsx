import Link from "next/link";
import { Package } from "lucide-react";
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
      className="scroll-mt-32 border-y border-violet-100/80 bg-white/60 px-4 py-16 backdrop-blur-sm sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl">
            Catálogo
          </h2>
          <p className="mt-2 text-base font-semibold text-neutral-800 sm:text-lg">
            Elegí tu producto con QR
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            Sumá al carrito y contactanos por WhatsApp para coordinar pago y envío.
          </p>
          <Link
            href="/activar"
            className="mt-4 inline-block text-sm font-semibold text-violet-700 hover:underline"
          >
            ¿Ya compraste? Activá tu producto →
          </Link>
        </div>

        <div className="mt-8">
          {products.length === 0 ? (
            <div className="rounded-3xl border border-violet-100 bg-white p-12 text-center shadow-sm">
              <Package className="mx-auto h-12 w-12 text-violet-400" aria-hidden />
              <p className="mt-4 text-lg font-medium text-neutral-800">
                El catálogo se está preparando
              </p>
              <p className="mt-2 text-neutral-600">
                Mientras tanto escribinos para coordinar tu pedido.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/contacto">
                  <Button variant="secondary">Escribinos</Button>
                </Link>
                <Link href="/activar">
                  <Button>Activar producto</Button>
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
