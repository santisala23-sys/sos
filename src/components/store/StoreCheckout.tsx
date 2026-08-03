"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Minus,
  Plus,
  ShoppingCart,
  X,
} from "lucide-react";
import type { StoreProductRow } from "@/lib/db/queries-store";
import {
  STORE_PRODUCT_TYPES,
  formatStorePrice,
  getStoreProductTypeLabel,
} from "@/lib/store/product-types";
import { getStoreProductImage } from "@/lib/store/product-images";
import {
  buildStoreCartWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/utils/contact";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type CartLine = Record<string, number>;

type StoreCheckoutProps = {
  products: StoreProductRow[];
};

function productIcon(type: string): string {
  return STORE_PRODUCT_TYPES.find((t) => t.value === type)?.icon ?? "📦";
}

export function StoreCheckout({ products }: StoreCheckoutProps) {
  const [cart, setCart] = useState<CartLine>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [cartAnimating, setCartAnimating] = useState(false);

  const cartItems = products
    .filter((p) => (cart[p.id] ?? 0) > 0)
    .map((p) => ({ product: p, quantity: cart[p.id] }));

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const whatsappUrl =
    cartCount > 0
      ? buildWhatsAppUrl(
          buildStoreCartWhatsAppMessage({
            items: cartItems.map(({ product, quantity }) => ({
              product_name: product.name,
              quantity,
              unit_price_label: formatStorePrice(
                product.price_cents,
                product.price_label,
              ),
            })),
          }),
        )
      : null;

  useEffect(() => {
    if (!cartOpen) return;
    setCartAnimating(true);
    const timer = window.setTimeout(() => setCartAnimating(false), 320);
    return () => window.clearTimeout(timer);
  }, [cartOpen, cartCount]);

  useEffect(() => {
    if (cartCount === 0) {
      setCartOpen(false);
    }
  }, [cartCount]);

  function setQty(productId: string, qty: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[productId];
      else next[productId] = Math.min(qty, 99);
      return next;
    });
  }

  function addToCart(productId: string) {
    setQty(productId, (cart[productId] ?? 0) + 1);
    setCartOpen(true);
  }

  return (
    <>
      {/* Botón compacto para reabrir el carrito */}
      {cartCount > 0 && !cartOpen && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="fixed top-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-xl shadow-violet-500/30 transition-transform hover:scale-105 active:scale-95 sm:top-28 sm:right-6"
          aria-label={`Abrir carrito (${cartCount} productos)`}
        >
          <ShoppingCart className="h-5 w-5" aria-hidden />
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-violet-700 ring-2 ring-violet-600">
            {cartCount}
          </span>
        </button>
      )}

      {/* Carrito flotante arriba a la derecha */}
      <div
        className={cn(
          "fixed top-24 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] origin-top-right transition-all duration-300 ease-out sm:top-28 sm:right-6",
          cartOpen && cartCount > 0
            ? "translate-x-0 scale-100 opacity-100"
            : "pointer-events-none translate-x-6 scale-95 opacity-0",
          cartAnimating && cartOpen && "animate-[cartPop_0.32s_ease-out]",
        )}
        aria-hidden={!cartOpen || cartCount === 0}
      >
        <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-2xl shadow-violet-500/20">
          <div className="flex items-center justify-between gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/25">
                <ShoppingCart className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold text-neutral-900">Tu carrito</p>
                <p className="text-xs text-neutral-500">
                  {cartCount} {cartCount === 1 ? "producto" : "productos"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-white/80 hover:text-neutral-800"
              aria-label="Cerrar carrito"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <ul className="max-h-[min(18rem,45vh)] space-y-3 overflow-y-auto px-4 py-4">
            {cartItems.map(({ product, quantity }) => (
              <li
                key={product.id}
                className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {product.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatStorePrice(product.price_cents, product.price_label)}
                  </p>
                </div>
                <div className="flex items-center rounded-lg border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setQty(product.id, quantity - 1)}
                    className="px-2 py-1 text-neutral-600 hover:bg-neutral-50"
                    aria-label={`Quitar uno de ${product.name}`}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-[1.75rem] text-center text-sm font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty(product.id, quantity + 1)}
                    className="px-2 py-1 text-neutral-600 hover:bg-neutral-50"
                    aria-label={`Agregar uno de ${product.name}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-violet-100 bg-neutral-50/80 px-4 py-4">
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full gap-2 bg-[#25D366] hover:bg-[#20bd5a]">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  Contactar por WPP
                </Button>
              </a>
            )}
            <p className="mt-2 text-center text-[11px] leading-relaxed text-neutral-500">
              Te armamos el mensaje con lo que elegiste
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-7 sm:grid-cols-2">
        {products.map((product) => {
          const qty = cart[product.id] ?? 0;
          const imageSrc = getStoreProductImage(product);
          return (
            <article
              key={product.id}
              className="group relative flex min-h-[28rem] flex-col overflow-hidden rounded-[1.75rem] border border-violet-200/70 bg-white shadow-lg shadow-violet-500/8 ring-1 ring-violet-100/80 transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/80 hover:shadow-2xl hover:shadow-violet-500/15"
            >
              <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-violet-100 via-indigo-50 to-white">
                {imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-6xl" aria-hidden>
                    {productIcon(product.product_type)}
                  </span>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/90 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                <span className="inline-flex w-fit rounded-full bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-700">
                  {getStoreProductTypeLabel(product.product_type)}
                </span>
                <h2 className="mt-3 text-xl font-black leading-tight text-neutral-900">
                  {product.name}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">
                  {product.description}
                </p>
                <div className="mt-5 flex items-end justify-between gap-3 border-t border-violet-100/80 pt-5">
                  <p className="text-2xl font-black tracking-tight text-neutral-900">
                    {formatStorePrice(product.price_cents, product.price_label)}
                  </p>
                </div>

                {qty === 0 ? (
                  <Button
                    type="button"
                    className="mt-4 w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20 hover:from-violet-700 hover:to-indigo-700"
                    onClick={() => addToCart(product.id)}
                  >
                    <ShoppingCart className="h-4 w-4" aria-hidden />
                    Agregar al carrito
                  </Button>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-xl border border-violet-200 bg-violet-50/50">
                        <button
                          type="button"
                          onClick={() => setQty(product.id, qty - 1)}
                          className="rounded-l-xl px-3 py-2 text-neutral-600 hover:bg-white"
                          aria-label="Quitar uno"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-[2rem] text-center font-semibold tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(product.id, qty + 1)}
                          className="rounded-r-xl px-3 py-2 text-neutral-600 hover:bg-white"
                          aria-label="Agregar uno"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCartOpen(true)}
                        className="text-xs font-semibold text-violet-700 hover:underline"
                      >
                        Ver carrito
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full gap-2"
                      onClick={() => addToCart(product.id)}
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                      Agregar otro
                    </Button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-10 text-center text-sm text-neutral-500">
        ¿Preferís probar gratis?{" "}
        <Link href="/register" className="font-semibold text-violet-700 hover:underline">
          Creá tu perfil e imprimí el QR
        </Link>
      </p>
    </>
  );
}
