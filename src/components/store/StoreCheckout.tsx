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
  getStoreProductTypeLabel,
} from "@/lib/store/product-types";
import { getStoreProductImages } from "@/lib/store/product-images";
import { StoreProductPrice } from "@/components/store/StoreProductPrice";
import { formatStorePriceForOrder } from "@/lib/store/store-pricing";
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

const AUTO_ADVANCE_MS = 4800;
const CARD_GAP_PX = 24;
const LOOP_COPIES = 3;
const MIN_CARD_WIDTH_PX = 300;
const MAX_CARD_WIDTH_PX = 420;

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
  const variantLabel =
    product.slug === "collar-qr-hueso"
      ? "Diseño hueso"
      : product.slug === "collar-qr-patita"
        ? "Diseño patita"
        : getStoreProductTypeLabel(product.product_type);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-violet-100/80 bg-white/95 shadow-lg shadow-violet-500/10 ring-1 ring-black/[0.03] transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/15">
      <div className="relative aspect-[5/6] overflow-hidden bg-neutral-100 sm:aspect-[4/5]">
        {images.length > 1 ? (
          <ProductImageCarousel images={images} alt={product.name} />
        ) : images.length === 1 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[0]}
            alt={product.name}
            className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-4xl"
            aria-hidden
          >
            {productIcon(product.product_type)}
          </span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-800 shadow-sm backdrop-blur-sm">
          {variantLabel}
        </span>
        {(product.discount_percent ?? 0) > 0 ? (
          <span
            className="absolute right-3 top-3 z-10 flex h-11 w-11 flex-col items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-md ring-2 ring-white/90"
            aria-label={`${product.discount_percent} por ciento de descuento`}
          >
            <span className="text-[9px] font-bold leading-none">−</span>
            <span className="text-xs font-black leading-none tabular-nums">
              {product.discount_percent}%
            </span>
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h2 className="text-base font-bold leading-snug text-neutral-900 sm:text-lg">
          {product.name}
        </h2>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-600">
          {product.description}
        </p>

        <div className="mt-4 border-t border-violet-100/80 pt-4">
          <StoreProductPrice
            price_cents={product.price_cents}
            price_label={product.price_label}
            discount_percent={product.discount_percent}
          />

          {qty === 0 ? (
            <Button
              type="button"
              size="md"
              className="mt-3 w-full gap-2 rounded-xl font-semibold shadow-sm shadow-violet-500/15"
              onClick={onAdd}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden />
              Agregar al carrito
            </Button>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center rounded-xl border border-violet-100 bg-violet-50/50">
                  <button
                    type="button"
                    onClick={() => onSetQty(qty - 1)}
                    className="rounded-l-xl px-3 py-2 text-neutral-600 hover:bg-white"
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
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function StoreCheckout({ products }: StoreCheckoutProps) {
  const [cart, setCart] = useState<CartLine>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(products.length);
  const [cardsVisible, setCardsVisible] = useState(1);
  const [cardWidth, setCardWidth] = useState(0);
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

  const canLoop = products.length > 0;
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
              unit_price_label: formatStorePriceForOrder({
                price_cents: product.price_cents,
                price_label: product.price_label,
                discount_percent: product.discount_percent,
              }),
            })),
          }),
        )
      : null;

  const measureCarousel = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const width = viewport.offsetWidth;
    let next = MAX_CARD_WIDTH_PX;
    if (cardsVisible >= 3) {
      next = (width - CARD_GAP_PX * 2) / 2.45;
    } else if (cardsVisible === 2) {
      next = (width - CARD_GAP_PX) / 1.72;
    } else {
      next = width * 0.9;
    }
    next = Math.min(MAX_CARD_WIDTH_PX, Math.max(MIN_CARD_WIDTH_PX, next));
    setCardWidth(next);
  }, [cardsVisible]);

  useEffect(() => {
    const smMq = window.matchMedia("(min-width: 640px)");
    const lgMq = window.matchMedia("(min-width: 1024px)");

    const xlMq = window.matchMedia("(min-width: 1280px)");

    const update = () => {
      if (xlMq.matches) setCardsVisible(Math.min(3, products.length));
      else if (lgMq.matches) setCardsVisible(Math.min(2, products.length));
      else if (smMq.matches) setCardsVisible(Math.min(2, products.length));
      else setCardsVisible(1);
    };

    update();
    smMq.addEventListener("change", update);
    lgMq.addEventListener("change", update);
    xlMq.addEventListener("change", update);
    return () => {
      smMq.removeEventListener("change", update);
      lgMq.removeEventListener("change", update);
      xlMq.removeEventListener("change", update);
    };
  }, [products.length]);

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
    if (paused || !canLoop || products.length < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = window.setInterval(() => {
      setAnimateSlide(true);
      setSlideIndex((index) => index + 1);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(id);
  }, [paused, canLoop, products.length]);

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
  const translateX = -slideOffset;
  const showControls = products.length > 1;

  return (
    <div className="w-full">
      <div
        className="relative min-w-0 -mx-1 sm:-mx-2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setPaused(false);
          }
        }}
      >
        {showControls && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-1 top-[42%] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-violet-100 bg-white/95 text-violet-800 shadow-md transition hover:bg-violet-50 sm:left-2"
              aria-label="Producto anterior"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-1 top-[42%] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-violet-100 bg-white/95 text-violet-800 shadow-md transition hover:bg-violet-50 sm:right-2"
              aria-label="Producto siguiente"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        )}

        <div ref={viewportRef} className="overflow-hidden px-1 py-2 sm:px-3">
          <div
            ref={trackRef}
            className={cn(
              "flex",
              animateSlide && "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
            )}
            style={{
              gap: CARD_GAP_PX,
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

        {showControls && (
          <div className="mt-6 flex justify-center gap-2">
            {products.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onClick={() => goToDot(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === activeDot
                    ? "w-8 bg-violet-600"
                    : "w-2 bg-violet-200 hover:bg-violet-300",
                )}
                aria-label={`Ver ${product.name}`}
              />
            ))}
          </div>
        )}
      </div>

      {cartCount > 0 && !cartOpen && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="mx-auto mt-8 flex items-center gap-2 rounded-full border border-violet-200 bg-white px-6 py-3 text-sm font-semibold text-violet-800 shadow-lg shadow-violet-500/10 transition hover:bg-violet-50"
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
        <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-xl shadow-violet-500/10">
          <div className="flex items-center justify-between gap-3 border-b border-violet-100 bg-violet-50/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
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
              className="rounded-lg p-2 text-neutral-500 hover:bg-white/80"
              aria-label="Cerrar carrito"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <ul className="max-h-64 space-y-0 divide-y divide-neutral-100 overflow-y-auto px-4">
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
                    <StoreProductPrice
                      price_cents={product.price_cents}
                      price_label={product.price_label}
                      discount_percent={product.discount_percent}
                      size="sm"
                    />
                  </p>
                </div>
                <div className="flex items-center rounded-lg border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setQty(product.id, quantity - 1)}
                    className="px-2 py-1"
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
                    className="px-2 py-1"
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
                  Pedir por WhatsApp
                </Button>
              </a>
            )}
            <p className="mt-2 text-center text-xs text-neutral-500">
              Coordinamos pago y envío por chat.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-neutral-500">
        ¿Ya tenés tu QR?{" "}
        <Link href="/activar" className="font-semibold text-neutral-800 hover:underline">
          Activá tu producto
        </Link>
      </p>
    </div>
  );
}
