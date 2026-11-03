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
      className="scroll-mt-32 px-4 pb-24 pt-6 sm:px-6 sm:pb-28 lg:px-8"
    >
      <div className="mx-auto w-full max-w-[88rem]">
        <div className="flex flex-col gap-4 border-b border-violet-200/70 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl lg:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600/90">
              Tienda
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl">
              Collares con{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                QR
              </span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
              Hueso o patita — agregá al carrito y pedí por WhatsApp.
            </p>
          </div>
          <Link
            href={activateHref}
            className="shrink-0 text-sm font-semibold text-violet-700 hover:text-violet-900 hover:underline lg:pb-1"
          >
            ¿Ya compraste? Activá tu producto →
          </Link>
        </div>

        <div className="mt-8 w-full sm:mt-10">
          <StoreCheckout products={products} />
        </div>
      </div>
    </section>
  );
}
