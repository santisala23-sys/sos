import Link from "next/link";
import { Package } from "lucide-react";
import { StoreCheckout } from "@/components/store/StoreCheckout";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";
import { getActivateCodeHref } from "@/lib/marketing/activate-link";
import { listActiveStoreProducts } from "@/lib/db/queries-store";
import { withStoreCatalogFallback } from "@/lib/store/catalog-fallback";
import { buildWhatsAppUrl } from "@/lib/utils/contact";

export async function StoreCatalogSection() {
  const session = await getSession();
  const activateHref = getActivateCodeHref(Boolean(session));

  let products: Awaited<ReturnType<typeof listActiveStoreProducts>> = [];
  try {
    products = withStoreCatalogFallback(await listActiveStoreProducts());
  } catch {
    products = withStoreCatalogFallback([]);
  }

  const whatsappPedido = buildWhatsAppUrl(
    "Hola SOSme, quiero consultar por productos del catálogo.",
  );

  return (
    <section
      id="catalogo"
      className="scroll-mt-32 px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-neutral-200/90 pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Catálogo
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            Productos con QR de SOSme. Agregá al carrito y pedí por WhatsApp; te
            confirmamos pago y envío.
          </p>
          <p className="mt-3 text-sm text-neutral-500">
            ¿Ya compraste?{" "}
            <Link
              href={activateHref}
              className="font-semibold text-neutral-800 underline-offset-2 hover:underline"
            >
              Activá tu producto
            </Link>
          </p>
        </header>

        <div className="mt-8">
          {products.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
              <Package
                className="mx-auto h-10 w-10 text-neutral-400"
                aria-hidden
              />
              <h2 className="mt-4 text-lg font-semibold text-neutral-900">
                No hay productos publicados todavía
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
                Estamos cargando el catálogo. Mientras tanto podés escribirnos
                para armar tu pedido.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={whatsappPedido}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="accent" size="md">
                    Consultar por WhatsApp
                  </Button>
                </a>
                <Link href="/contacto">
                  <Button variant="secondary" size="md">
                    Contacto
                  </Button>
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
