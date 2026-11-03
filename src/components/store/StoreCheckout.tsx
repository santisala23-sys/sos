"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Minus, Plus, ShoppingCart } from "lucide-react";
import type { StoreProductRow } from "@/lib/db/queries-store";
import {
  STORE_PRODUCT_TYPES,
  formatStorePrice,
  getStoreProductTypeLabel,
} from "@/lib/store/product-types";
import { getStoreProductImages } from "@/lib/store/product-images";
import { ProductImageCarousel } from "@/components/store/ProductImageCarousel";
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

type ProductCardProps = {
  product: StoreProductRow;
  qty: number;
  onAdd: () => void;
  onSetQty: (qty: number) => void;
};

function ProductCard({ product, qty, onAdd, onSetQty }: ProductCardProps) {
  const images = getStoreProductImages(product);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300 hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {images.length > 1 ? (
          <ProductImageCarousel images={images} alt={product.name} />
        ) : images.length === 1 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[0]}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-4xl"
            aria-hidden
          >
            {productIcon(product.product_type)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          {getStoreProductTypeLabel(product.product_type)}
        </span>
        <h2 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug text-neutral-900">
          {product.name}
        </h2>
        {product.description ? (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-600">
            {product.description}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="mt-4 border-t border-neutral-100 pt-4">
          <p className="text-lg font-bold tabular-nums text-neutral-900">
            {formatStorePrice(product.price_cents, product.price_label)}
          </p>

          {qty === 0 ? (
            <Button
              type="button"
              size="md"
              variant="secondary"
              className="mt-3 w-full gap-2 border-neutral-200 bg-neutral-50 font-semibold hover:bg-neutral-100"
              onClick={onAdd}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden />
              Agregar al carrito
            </Button>
          ) : (
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50">
                <button
                  type="button"
                  onClick={() => onSetQty(qty - 1)}
                  className="rounded-l-lg px-3 py-2 text-neutral-600 hover:bg-white"
                  aria-label="Quitar uno"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => onSetQty(qty + 1)}
                  className="rounded-r-lg px-3 py-2 text-neutral-600 hover:bg-white"
                  aria-label="Agregar uno"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs font-medium text-neutral-500">En carrito</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function CartPanel({
  cartItems,
  cartCount,
  whatsappUrl,
  onSetQty,
  className,
}: {
  cartItems: Array<{ product: StoreProductRow; quantity: number }>;
  cartCount: number;
  whatsappUrl: string | null;
  onSetQty: (productId: string, qty: number) => void;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "rounded-xl border border-neutral-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="border-b border-neutral-100 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-neutral-700" aria-hidden />
          <h2 className="text-base font-bold text-neutral-900">Carrito</h2>
          {cartCount > 0 && (
            <span className="ml-auto rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-neutral-700">
              {cartCount}
            </span>
          )}
        </div>
      </div>

      {cartCount === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-neutral-500">
          Todavía no agregaste productos.
        </p>
      ) : (
        <>
          <ul className="max-h-[min(24rem,50vh)] space-y-0 divide-y divide-neutral-100 overflow-y-auto px-4">
            {cartItems.map(({ product, quantity }) => (
              <li
                key={product.id}
                className="flex items-start justify-between gap-3 py-3"
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
                    onClick={() => onSetQty(product.id, quantity - 1)}
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
                    onClick={() => onSetQty(product.id, quantity + 1)}
                    className="px-2 py-1 text-neutral-600 hover:bg-neutral-50"
                    aria-label={`Agregar uno de ${product.name}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-neutral-100 p-4">
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="w-full gap-2 bg-[#25D366] hover:bg-[#20bd5a]">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  Pedir por WhatsApp
                </Button>
              </a>
            )}
            <p className="mt-2 text-center text-xs text-neutral-500">
              Coordinamos pago y envío por chat.
            </p>
          </div>
        </>
      )}
    </aside>
  );
}

export function StoreCheckout({ products }: StoreCheckoutProps) {
  const [cart, setCart] = useState<CartLine>({});

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
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_17.5rem] xl:grid-cols-[1fr_19rem] xl:gap-10">
        <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              qty={cart[product.id] ?? 0}
              onAdd={() => addToCart(product.id)}
              onSetQty={(qty) => setQty(product.id, qty)}
            />
          ))}
        </div>

        <CartPanel
          cartItems={cartItems}
          cartCount={cartCount}
          whatsappUrl={whatsappUrl}
          onSetQty={setQty}
          className="lg:sticky lg:top-28"
        />
      </div>

      <p className="mt-10 text-center text-sm text-neutral-500">
        ¿Ya tenés tu QR?{" "}
        <Link href="/activar" className="font-semibold text-neutral-800 hover:underline">
          Activá tu producto
        </Link>
        {" · "}
        <Link href="/register" className="font-semibold text-neutral-800 hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
