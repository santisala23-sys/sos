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
      className="scroll-mt-32 border-y border-violet-100/80 bg-white/60 px-4 py-24 backdrop-blur-sm sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Catálogo
          </h2>
          <p className="mt-3 text-xl font-bold text-neutral-800 sm:text-2xl">
            Elegí tu producto con QR
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-neutral-600">
            Sumá al carrito y contactanos por WhatsApp para coordinar pago y envío.
          </p>
          <Link
            href="/register"
            className="mt-4 inline-block text-sm font-semibold text-violet-700 hover:underline"
          >
            ¿Preferís imprimir el QR vos mismo? →
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
                Mientras tanto podés crear tu perfil digital.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/contacto">
                  <Button variant="secondary">Escribinos</Button>
                </Link>
                <Link href="/register">
                  <Button>Crear perfil</Button>
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
