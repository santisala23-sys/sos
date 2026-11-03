"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, Minus, Plus, ShoppingCart, X } from "lucide-react";
import type { StoreProductRow } from "@/lib/db/queries-store";
import { getStoreProductImages } from "@/lib/store/product-images";
import {
  formatCentsAsPesos,
  resolveStoreProductPricing,
} from "@/lib/store/store-pricing";
import { Button } from "@/components/ui/Button";

export type StoreCartItem = {
  product: StoreProductRow;
  quantity: number;
};

type StoreCartDrawerProps = {
  open: boolean;
  items: StoreCartItem[];
  whatsappUrl: string | null;
  totalLabel: string | null;
  onClose: () => void;
  onOpen: () => void;
  onSetQty: (productId: string, qty: number) => void;
};

function lineTotalLabel(item: StoreCartItem): string {
  const pricing = resolveStoreProductPricing(item.product);
  if (!pricing.hasNumericPrice || pricing.saleCents == null) {
    return pricing.displayLabel;
  }
  return formatCentsAsPesos(pricing.saleCents * item.quantity);
}

export function StoreCartDrawer({
  open,
  items,
  whatsappUrl,
  totalLabel,
  onClose,
  onOpen,
  onSetQty,
}: StoreCartDrawerProps) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (count === 0 || typeof document === "undefined") return null;

  return createPortal(
    <>
      {!open && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-5 right-[5.5rem] z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-2xl shadow-violet-900/20 transition-transform hover:scale-[1.03] active:scale-[0.98]"
          aria-label={`Abrir carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
        >
          <ShoppingCart className="h-6 w-6" aria-hidden />
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-neutral-950 px-1.5 text-xs font-bold text-white">
            {count}
          </span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-neutral-950/40"
            aria-label="Cerrar carrito"
            onClick={onClose}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Tu carrito"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-violet-100 px-5 py-4">
              <div>
                <p className="text-lg font-bold text-neutral-900">Tu carrito</p>
                <p className="text-sm text-neutral-500">
                  {count} {count === 1 ? "producto" : "productos"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-neutral-500 hover:bg-violet-50"
                aria-label="Ocultar carrito"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ul className="flex-1 space-y-0 divide-y divide-neutral-100 overflow-y-auto px-5">
              {items.map(({ product, quantity }) => {
                const image = getStoreProductImages(product)[0];
                const pricing = resolveStoreProductPricing(product);
                return (
                  <li key={product.id} className="flex gap-3 py-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-neutral-900">
                          {product.name}
                        </p>
                        <p className="shrink-0 text-sm font-bold text-violet-800">
                          {lineTotalLabel({ product, quantity })}
                        </p>
                      </div>
                      {lineTotalLabel({ product, quantity }) !==
                      pricing.displayLabel ? (
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {pricing.displayLabel} × {quantity}
                        </p>
                      ) : null}
                      <div className="mt-2 inline-flex items-center rounded-lg border border-neutral-200">
                        <button
                          type="button"
                          onClick={() => onSetQty(product.id, quantity - 1)}
                          className="px-2.5 py-1.5 text-neutral-600 hover:bg-neutral-50"
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
                          className="px-2.5 py-1.5 text-neutral-600 hover:bg-neutral-50"
                          aria-label={`Agregar uno de ${product.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-violet-100 bg-neutral-50/80 px-5 py-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-neutral-600">Total</p>
                <p className="text-lg font-black text-neutral-900">
                  {totalLabel ?? "A confirmar"}
                </p>
              </div>
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="w-full gap-2 bg-[#25D366] hover:bg-[#20bd5a]"
                  >
                    <MessageCircle className="h-5 w-5" aria-hidden />
                    Pedir por WhatsApp
                  </Button>
                </a>
              )}
              <p className="mt-2 text-center text-xs text-neutral-500">
                Coordinamos pago y envío por chat.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>,
    document.body,
  );
}
