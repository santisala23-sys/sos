import Link from "next/link";
import { StoreCheckout } from "@/components/store/StoreCheckout";
import { getSession } from "@/lib/auth/session";
import { getActivateCodeHref } from "@/lib/marketing/activate-link";
import { listActiveStoreProducts } from "@/lib/db/queries-store";
import { withStoreCatalogFallback } from "@/lib/store/catalog-fallback";

export async function StoreCatalogSection() {
  const session = await getSession();
  const activateHref = getActivateCodeHref(Boolean(session));

  let products: Awaited<ReturnType<typeof listActiveStoreProducts>> = [];
  try {
    products = withStoreCatalogFallback(await listActiveStoreProducts());
  } catch {
    products = withStoreCatalogFallback([]);
  }

  return (
    <section
      id="catalogo"
      className="scroll-mt-32 px-4 pb-20 pt-4 sm:px-6 sm:pb-24 lg:px-8"
    >
      <div className="mx-auto max-w-[88rem]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600/90">
            Tienda
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl">
            Collares con{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
              QR
            </span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
            Elegí diseño hueso o patita, sumá al carrito y pedí por WhatsApp.
          </p>
          <Link
            href={activateHref}
            className="mt-4 inline-block text-sm font-semibold text-violet-700 hover:text-violet-900 hover:underline"
          >
            ¿Ya compraste? Activá tu producto
          </Link>
        </div>

        <div className="mt-10 sm:mt-12">
          <StoreCheckout products={products} />
        </div>
      </div>
    </section>
  );
}
