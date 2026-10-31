import Link from "next/link";
import { ArrowRight, MessageCircle, Package, ShoppingBag } from "lucide-react";
import { StoreCheckout } from "@/components/store/StoreCheckout";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";
import { getActivateCodeHref } from "@/lib/marketing/activate-link";
import { listActiveStoreProducts } from "@/lib/db/queries-store";
import { buildWhatsAppUrl } from "@/lib/utils/contact";

const STEPS = [
  {
    step: "01",
    title: "Elegís tu producto",
    text: "Chapitas, collares, stickers y más — todos con QR listo para activar.",
  },
  {
    step: "02",
    title: "Sumás al carrito",
    text: "Armás tu pedido en la tienda y revisás cantidades antes de enviar.",
  },
  {
    step: "03",
    title: "Coordinás por WhatsApp",
    text: "Te escribimos para confirmar pago, envío y cualquier detalle.",
  },
] as const;

export async function StoreCatalogSection() {
  const session = await getSession();
  const activateHref = getActivateCodeHref(Boolean(session));

  let products: Awaited<ReturnType<typeof listActiveStoreProducts>> = [];
  try {
    products = await listActiveStoreProducts();
  } catch {
    products = [];
  }

  const whatsappPedido = buildWhatsAppUrl(
    "Hola SOSme, quiero coordinar un pedido de productos con QR.",
  );

  return (
    <section className="scroll-mt-32 px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-28">
      <div className="mx-auto max-w-[88rem]">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600/90">
            Tienda
          </p>
          <h1 className="mt-3 text-3xl font-black leading-[1.08] tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.75rem]">
            Elegí tu producto{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
              con QR
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            Sumá al carrito y contactanos por WhatsApp para coordinar pago y envío.
          </p>
          <Link
            href={activateHref}
            className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 transition-colors hover:text-violet-900"
          >
            ¿Ya compraste? Activá tu producto
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-5">
          {STEPS.map(({ step, title, text }) => (
            <article
              key={step}
              className="flex flex-col rounded-2xl border border-violet-100/90 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition hover:border-violet-200 hover:shadow-md hover:shadow-violet-500/8 sm:p-6"
            >
              <span className="text-3xl font-black tabular-nums leading-none text-violet-600 sm:text-4xl">
                {step}
              </span>
              <h2 className="mt-4 text-base font-bold text-neutral-900 sm:text-lg">
                {title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">
                {text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 sm:mt-14">
          {products.length === 0 ? (
            <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-[#e4e9f7] px-6 py-14 text-center sm:rounded-[2.5rem] sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <span className="absolute -right-2 top-6 h-28 w-11 rotate-[38deg] rounded-full border-2 border-violet-400/35" />
                <span className="absolute right-14 top-2 h-20 w-9 rotate-[38deg] rounded-full border-2 border-violet-400/30" />
                <span className="absolute bottom-4 left-6 h-24 w-10 -rotate-[36deg] rounded-full border-2 border-violet-400/35" />
                <span className="absolute bottom-10 left-20 h-16 w-8 -rotate-[36deg] rounded-full border-2 border-violet-400/28" />
              </div>

              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 shadow-sm ring-1 ring-violet-200/60">
                <Package className="h-8 w-8 text-violet-600" aria-hidden />
              </div>
              <h2 className="relative mt-6 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl">
                El catálogo se está preparando
              </h2>
              <p className="relative mx-auto mt-3 max-w-md text-base leading-relaxed text-neutral-700">
                Mientras tanto escribinos y te ayudamos a armar tu pedido de productos
                con QR.
              </p>

              <div className="relative mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <a href={whatsappPedido} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="md"
                    className="w-full gap-2 rounded-xl bg-neutral-900 px-7 font-semibold text-white shadow-sm hover:bg-neutral-800 sm:w-auto"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    Escribinos por WhatsApp
                  </Button>
                </a>
                <Link href={activateHref} className="sm:inline-flex">
                  <Button
                    variant="ghost"
                    size="md"
                    className="w-full rounded-xl border border-neutral-900/15 bg-white/50 px-7 font-semibold text-neutral-900 backdrop-blur-sm hover:bg-white/80 sm:w-auto"
                  >
                    Activar producto
                  </Button>
                </Link>
              </div>

              <p className="relative mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-neutral-600 sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-violet-600" aria-hidden />
                  Pedidos a medida
                </span>
                <span className="hidden text-neutral-400 sm:inline" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 text-violet-600" aria-hidden />
                  Respuesta por WhatsApp
                </span>
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-violet-200/70 bg-white/55 p-4 shadow-sm shadow-violet-500/5 backdrop-blur-sm sm:rounded-[2.5rem] sm:p-6 lg:p-8">
              <StoreCheckout products={products} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
