"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Minus, Plus, ShoppingCart } from "lucide-react";
import type { StoreProductRow } from "@/lib/db/queries-store";
import {
  STORE_PRODUCT_TYPES,
  formatStorePrice,
  getStoreProductTypeLabel,
} from "@/lib/store/product-types";
import {
  buildStoreOrderWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/utils/contact";
import { Button } from "@/components/ui/Button";

type CartLine = Record<string, number>;

type StoreCheckoutProps = {
  products: StoreProductRow[];
};

function productIcon(type: string): string {
  return STORE_PRODUCT_TYPES.find((t) => t.value === type)?.icon ?? "📦";
}

export function StoreCheckout({ products }: StoreCheckoutProps) {
  const [cart, setCart] = useState<CartLine>({});
  const [step, setStep] = useState<"browse" | "checkout" | "done">("browse");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const cartItems = products
    .filter((p) => (cart[p.id] ?? 0) > 0)
    .map((p) => ({ product: p, quantity: cart[p.id] }));

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  function setQty(productId: string, qty: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[productId];
      else next[productId] = Math.min(qty, 99);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          shipping_address: shippingAddress || undefined,
          customer_notes: customerNotes || undefined,
          items: cartItems.map(({ product, quantity }) => ({
            product_id: product.id,
            quantity,
          })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar el pedido");
        return;
      }

      const order = data.order;
      setOrderId(order.id);
      setWhatsappUrl(
        buildWhatsAppUrl(
          buildStoreOrderWhatsAppMessage({
            orderId: order.id,
            customerName: order.customer_name,
            customerPhone: order.customer_phone,
            customerEmail: order.customer_email,
            shippingAddress: order.shipping_address,
            customerNotes: order.customer_notes,
            items: (order.items ?? []).map(
              (i: { product_name: string; quantity: number; unit_price_label: string }) => ({
                product_name: i.product_name,
                quantity: i.quantity,
                unit_price_label: i.unit_price_label,
              }),
            ),
          }),
        ),
      );
      setStep("done");
      setCart({});
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done" && orderId) {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" aria-hidden />
        <h2 className="mt-4 text-2xl font-black text-green-900">¡Pedido recibido!</h2>
        <p className="mt-2 text-green-800">
          Tu solicitud <strong>#{orderId.slice(0, 8).toUpperCase()}</strong> quedó registrada.
          Te contactamos pronto con precio de envío y formas de pago.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2">
                <MessageCircle className="h-5 w-5" aria-hidden />
                Confirmar por WhatsApp
              </Button>
            </a>
          )}
          <Link href="/register">
            <Button variant="secondary" size="lg">
              Crear mi perfil QR gratis
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-green-700/80">
          Cada producto incluye QR SOSme. Si aún no tenés cuenta, registrate gratis (1 perfil)
          o pedinos más perfiles por contacto.
        </p>
      </div>
    );
  }

  if (step === "checkout") {
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900">Datos del pedido</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Sin pago online por ahora — te contactamos para coordinar precio y envío.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-neutral-700">
              Nombre completo *
              <input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-700">
              Email *
              <input
                required
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-700">
              Teléfono / WhatsApp *
              <input
                required
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-700">
              Dirección de envío (opcional)
              <input
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Ciudad, calle, código postal..."
                className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-700">
              Notas (talle, color, urgencia...)
              <textarea
                rows={3}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Enviando..." : "Enviar pedido"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setStep("browse")}>
              Volver al catálogo
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
          <h3 className="font-bold text-neutral-900">Resumen</h3>
          <ul className="mt-4 space-y-3">
            {cartItems.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between text-sm">
                <span>
                  {quantity}x {product.name}
                </span>
                <span className="text-neutral-500">
                  {formatStorePrice(product.price_cents, product.price_label)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const qty = cart[product.id] ?? 0;
          return (
            <article
              key={product.id}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-violet-50 to-indigo-50">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-6xl" aria-hidden>
                    {productIcon(product.product_type)}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                  {getStoreProductTypeLabel(product.product_type)}
                </p>
                <h2 className="mt-1 text-lg font-bold text-neutral-900">{product.name}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">
                  {product.description}
                </p>
                <p className="mt-4 text-lg font-black text-neutral-900">
                  {formatStorePrice(product.price_cents, product.price_label)}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center rounded-xl border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => setQty(product.id, qty - 1)}
                      className="rounded-l-xl px-3 py-2 text-neutral-600 hover:bg-neutral-50"
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
                      className="rounded-r-xl px-3 py-2 text-neutral-600 hover:bg-neutral-50"
                      aria-label="Agregar uno"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {qty > 0 && (
                    <span className="text-xs font-medium text-violet-700">En el pedido</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {cartCount > 0 && (
        <div className="sticky bottom-4 z-10 mx-auto mt-10 max-w-lg">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-violet-200 bg-white px-5 py-4 shadow-xl shadow-violet-500/15">
            <div className="flex items-center gap-2 text-neutral-900">
              <ShoppingCart className="h-5 w-5 text-violet-600" aria-hidden />
              <span className="font-semibold">
                {cartCount} {cartCount === 1 ? "producto" : "productos"}
              </span>
            </div>
            <Button onClick={() => setStep("checkout")}>Continuar pedido</Button>
          </div>
        </div>
      )}
    </>
  );
}
