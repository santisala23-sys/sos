"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
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

const AUTO_ADVANCE_MS = 4500;
const CARD_GAP_PX = 16;
const LOOP_COPIES = 3;

function productIcon(type: string): string {
  return STORE_PRODUCT_TYPES.find((t) => t.value === type)?.icon ?? "📦";
}

type ProductCardProps = {
  product: StoreProductRow;
  qty: number;
  onAdd: () => void;
  onSetQty: (qty: number) => void;
  onOpenCart: () => void;
};

function ProductCard({
  product,
  qty,
  onAdd,
  onSetQty,
  onOpenCart,
}: ProductCardProps) {
  const images = getStoreProductImages(product);

  return (
    <article className="group relative flex h-full min-h-[26rem] flex-col overflow-hidden rounded-[1.75rem] border border-violet-200/70 bg-white shadow-lg shadow-violet-500/8 ring-1 ring-violet-100/80 transition-all duration-300 hover:border-violet-300/80 hover:shadow-2xl hover:shadow-violet-500/15">
      <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-violet-100 via-indigo-50 to-white">
        {images.length > 1 ? (
          <ProductImageCarousel images={images} alt={product.name} />
        ) : images.length === 1 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[0]}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-6xl"
            aria-hidden
          >
            {productIcon(product.product_type)}
          </span>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/90 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
        <span className="inline-flex w-fit rounded-full bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-700">
          {getStoreProductTypeLabel(product.product_type)}
        </span>
        <h2 className="mt-3 text-lg font-black leading-tight text-neutral-900 sm:text-xl">
          {product.name}
        </h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">
          {product.description}
        </p>
        <div className="mt-4 border-t border-violet-100/80 pt-4">
          <p className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl">
            {formatStorePrice(product.price_cents, product.price_label)}
          </p>
        </div>

        {qty === 0 ? (
          <Button
            type="button"
            className="mt-4 w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20 hover:from-violet-700 hover:to-indigo-700"
            onClick={onAdd}
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
                  onClick={() => onSetQty(qty - 1)}
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
                  onClick={() => onSetQty(qty + 1)}
                  className="rounded-r-xl px-3 py-2 text-neutral-600 hover:bg-white"
                  aria-label="Agregar uno"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={onOpenCart}
                className="text-xs font-semibold text-violet-700 hover:underline"
              >
                Ver carrito
              </button>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2"
              onClick={onAdd}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Agregar otro
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}

export function StoreCheckout({ products }: StoreCheckoutProps) {
  const [cart, setCart] = useState<CartLine>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(products.length);
  const [cardsVisible, setCardsVisible] = useState(2);
  const [cardWidth, setCardWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animateSlide, setAnimateSlide] = useState(true);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cartPanelRef = useRef<HTMLDivElement>(null);

  const loopProducts = useMemo(
    () =>
      products.length > 0
        ? Array.from({ length: LOOP_COPIES }, () => products).flat()
        : [],
    [products],
  );

  const cartItems = products
    .filter((p) => (cart[p.id] ?? 0) > 0)
    .map((p) => ({ product: p, quantity: cart[p.id] }));

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const canLoop = products.length > 1;
  const activeDot =
    products.length > 0
      ? ((slideIndex - products.length) % products.length + products.length) %
        products.length
      : 0;

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

  const measureCarousel = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const width = viewport.offsetWidth;
    const ratio = cardsVisible === 2 ? 0.42 : 0.76;
    setViewportWidth(width);
    setCardWidth(width * ratio);
  }, [cardsVisible]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setCardsVisible(mq.matches ? 2 : 1);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    measureCarousel();
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(measureCarousel);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [measureCarousel]);

  useEffect(() => {
    setSlideIndex(products.length);
  }, [products.length]);

  useEffect(() => {
    if (paused || !canLoop) return;

    const id = window.setInterval(() => {
      setAnimateSlide(true);
      setSlideIndex((index) => index + 1);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(id);
  }, [paused, canLoop]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || products.length === 0) return;

    function handleTransitionEnd(event: TransitionEvent) {
      if (event.propertyName !== "transform") return;

      setSlideIndex((index) => {
        if (index >= products.length * 2) {
          setAnimateSlide(false);
          return index - products.length;
        }
        if (index < products.length) {
          setAnimateSlide(false);
          return index + products.length;
        }
        return index;
      });
    }

    track.addEventListener("transitionend", handleTransitionEnd);
    return () => track.removeEventListener("transitionend", handleTransitionEnd);
  }, [products.length]);

  useEffect(() => {
    if (animateSlide) return;
    const id = window.requestAnimationFrame(() => setAnimateSlide(true));
    return () => window.cancelAnimationFrame(id);
  }, [animateSlide]);

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
    window.requestAnimationFrame(() => {
      cartPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function goPrev() {
    setAnimateSlide(true);
    setSlideIndex((index) => index - 1);
  }

  function goNext() {
    setAnimateSlide(true);
    setSlideIndex((index) => index + 1);
  }

  function goToDot(dotIndex: number) {
    setAnimateSlide(true);
    setSlideIndex(products.length + dotIndex);
  }

  const slideOffset = slideIndex * (cardWidth + CARD_GAP_PX);
  const visibleWidth =
    cardsVisible * cardWidth + (cardsVisible - 1) * CARD_GAP_PX;
  const centerOffset = Math.max(0, (viewportWidth - visibleWidth) / 2);
  const translateX = centerOffset - slideOffset;
  const showArrows = products.length > 1;

  return (
    <>
      <div
        className="relative mx-auto max-w-5xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPaused(false);
          }
        }}
      >
        {showArrows && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-violet-200/80 bg-white/95 text-violet-700 shadow-lg shadow-violet-500/10 transition hover:bg-violet-50 sm:-left-2 sm:h-11 sm:w-11"
              aria-label="Producto anterior"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-violet-200/80 bg-white/95 text-violet-700 shadow-lg shadow-violet-500/10 transition hover:bg-violet-50 sm:-right-2 sm:h-11 sm:w-11"
              aria-label="Producto siguiente"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        )}

        <div ref={viewportRef} className="overflow-hidden px-2 sm:px-8">
          <div
            ref={trackRef}
            className={cn(
              "flex gap-4",
              animateSlide && "transition-transform duration-500 ease-out",
            )}
            style={{
              transform: cardWidth ? `translateX(${translateX}px)` : undefined,
            }}
          >
            {loopProducts.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                className="shrink-0"
                style={{ width: cardWidth || undefined }}
              >
                <ProductCard
                  product={product}
                  qty={cart[product.id] ?? 0}
                  onAdd={() => addToCart(product.id)}
                  onSetQty={(qty) => setQty(product.id, qty)}
                  onOpenCart={() => {
                    setCartOpen(true);
                    cartPanelRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                    });
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {showArrows && (
          <div className="mt-5 flex justify-center gap-2">
            {products.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToDot(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === activeDot
                    ? "w-6 bg-violet-600"
                    : "w-2 bg-violet-200 hover:bg-violet-300",
                )}
                aria-label={`Ir al producto ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {cartCount > 0 && !cartOpen && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="mx-auto mt-8 flex items-center gap-2 rounded-full border border-violet-200 bg-white px-5 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden />
          Ver carrito ({cartCount})
        </button>
      )}

      <div
        ref={cartPanelRef}
        className={cn(
          "mx-auto mt-8 max-w-md overflow-hidden transition-all duration-300 ease-out",
          cartOpen && cartCount > 0
            ? "max-h-[32rem] opacity-100"
            : "pointer-events-none max-h-0 opacity-0",
        )}
        aria-hidden={!cartOpen || cartCount === 0}
      >
        <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-xl shadow-violet-500/15">
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

          <ul className="max-h-64 space-y-3 overflow-y-auto px-4 py-4">
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

      <p className="mt-10 text-center text-sm text-neutral-500">
        ¿Preferís probar gratis?{" "}
        <Link href="/register" className="font-semibold text-violet-700 hover:underline">
          Creá tu perfil e imprimí el QR
        </Link>
      </p>
    </>
  );
}
