"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, ShoppingBag, Trash2 } from "lucide-react";
import type { StoreOrderRow, StoreProductRow } from "@/lib/db/queries-store";
import {
  STORE_ORDER_STATUSES,
  STORE_PRODUCT_TYPES,
  formatStorePrice,
  getStoreOrderStatusLabel,
  getStoreProductTypeLabel,
} from "@/lib/store/product-types";
import { formatDateTime } from "@/lib/utils/format";
import { AdminLoading, AdminSubTabs } from "@/components/admin/AdminUiParts";
import { adminUi } from "@/components/admin/adminUi";

type StoreSubTab = "products" | "orders";

const emptyProductForm = {
  name: "",
  product_type: "colgante",
  description: "",
  price_cents: "",
  price_label: "Consultar",
  image_url: "",
  sort_order: "0",
  is_active: true,
};

export function AdminStorePanel() {
  const [subTab, setSubTab] = useState<StoreSubTab>("products");
  const [products, setProducts] = useState<StoreProductRow[]>([]);
  const [orders, setOrders] = useState<StoreOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProductForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (subTab === "products") {
        const res = await fetch("/api/admin/store-products");
        if (res.ok) setProducts((await res.json()).products ?? []);
      } else {
        const res = await fetch("/api/admin/store-orders");
        if (res.ok) setOrders((await res.json()).orders ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [subTab]);

  useEffect(() => {
    load();
  }, [load]);

  function resetForm() {
    setForm(emptyProductForm);
    setEditingId(null);
    setError(null);
  }

  function startEdit(product: StoreProductRow) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      product_type: product.product_type,
      description: product.description,
      price_cents: product.price_cents != null ? String(product.price_cents) : "",
      price_label: product.price_label,
      image_url: product.image_url ?? "",
      sort_order: String(product.sort_order),
      is_active: product.is_active,
    });
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      product_type: form.product_type,
      description: form.description,
      price_cents: form.price_cents ? Number(form.price_cents) : null,
      price_label: form.price_label || "Consultar",
      image_url: form.image_url || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    try {
      const res = await fetch(
        editingId ? `/api/admin/store-products/${editingId}` : "/api/admin/store-products",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al guardar");
        return;
      }
      resetForm();
      await load();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto del catálogo?")) return;
    await fetch(`/api/admin/store-products/${id}`, { method: "DELETE" });
    await load();
  }

  async function handleOrderStatus(orderId: string, status: string) {
    await fetch(`/api/admin/store-orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <div className="space-y-6">
      <AdminSubTabs
        active={subTab}
        onChange={(id) => setSubTab(id as StoreSubTab)}
        tabs={[
          { id: "products", label: "Productos" },
          {
            id: "orders",
            label: "Pedidos",
            icon: <ShoppingBag className="h-4 w-4" />,
            badge: orders.filter((o) => o.status === "pending").length,
          },
        ]}
      />

      {subTab === "products" && (
        <>
          <form onSubmit={handleSaveProduct} className={adminUi.formCard}>
            <div className="flex items-center gap-2 text-neutral-900">
              {editingId ? (
                <Pencil className="h-5 w-5 text-violet-600" />
              ) : (
                <Plus className="h-5 w-5 text-violet-600" />
              )}
              <h2 className="text-lg font-bold">
                {editingId ? "Editar producto" : "Nuevo producto"}
              </h2>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className={`${adminUi.label} sm:col-span-2`}>
                Nombre *
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`mt-1.5 w-full ${adminUi.inputPlain}`}
                />
              </label>
              <label className={adminUi.label}>
                Tipo
                <select
                  value={form.product_type}
                  onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                  className={`mt-1.5 w-full ${adminUi.inputPlain}`}
                >
                  {STORE_PRODUCT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={adminUi.label}>
                Orden
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className={`mt-1.5 w-full ${adminUi.inputPlain}`}
                />
              </label>
              <label className={adminUi.label}>
                Precio (centavos ARS, opcional)
                <input
                  type="number"
                  min={0}
                  value={form.price_cents}
                  onChange={(e) => setForm({ ...form, price_cents: e.target.value })}
                  placeholder="Ej. 450000 = $4500"
                  className={`mt-1.5 w-full ${adminUi.inputPlain}`}
                />
              </label>
              <label className={adminUi.label}>
                Etiqueta de precio
                <input
                  value={form.price_label}
                  onChange={(e) => setForm({ ...form, price_label: e.target.value })}
                  placeholder="Consultar"
                  className={`mt-1.5 w-full ${adminUi.inputPlain}`}
                />
              </label>
              <label className={`${adminUi.label} sm:col-span-2`}>
                URL de imagen (opcional)
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className={`mt-1.5 w-full ${adminUi.inputPlain}`}
                />
              </label>
              <label className={`${adminUi.label} sm:col-span-2`}>
                Descripción
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`mt-1.5 w-full ${adminUi.inputPlain}`}
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-neutral-300 text-violet-600 focus:ring-violet-500"
                />
                Visible en la tienda
              </label>
            </div>

            {error && <p className={`mt-4 ${adminUi.alertError}`}>{error}</p>}

            <div className="mt-6 flex flex-wrap gap-2">
              <button type="submit" disabled={saving} className={adminUi.primaryBtn}>
                {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear producto"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className={adminUi.secondaryBtn}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>

          {loading ? (
            <AdminLoading label="Cargando productos..." />
          ) : (
            <div className={adminUi.tableWrap}>
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className={adminUi.tableHead}>
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Orden</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {products.map((p) => (
                    <tr key={p.id} className={adminUi.tableRow}>
                      <td className={`${adminUi.tableCell} font-medium`}>{p.name}</td>
                      <td className={`${adminUi.tableCell} text-neutral-500`}>
                        {getStoreProductTypeLabel(p.product_type)}
                      </td>
                      <td className={adminUi.tableCell}>
                        {formatStorePrice(p.price_cents, p.price_label)}
                      </td>
                      <td className={`${adminUi.tableCell} tabular-nums`}>{p.sort_order}</td>
                      <td className={adminUi.tableCell}>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            p.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {p.is_active ? "activo" : "oculto"}
                        </span>
                      </td>
                      <td className={adminUi.tableCell}>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className={adminUi.editBtn}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {subTab === "orders" && (
        <>
          {loading ? (
            <AdminLoading label="Cargando pedidos..." />
          ) : orders.length === 0 ? (
            <p className={adminUi.empty}>Todavía no hay pedidos.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article key={order.id} className={adminUi.card}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-neutral-900">
                        {order.customer_name}
                        <span className="ml-2 font-mono text-xs font-normal text-neutral-500">
                          #{order.id.slice(0, 8)}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-neutral-600">
                        {order.customer_email} · {order.customer_phone}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {formatDateTime(order.created_at)}
                        {order.user_email ? ` · cuenta: ${order.user_email}` : ""}
                      </p>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => handleOrderStatus(order.id, e.target.value)}
                      className={adminUi.inputPlain}
                    >
                      {STORE_ORDER_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <ul className="mt-4 space-y-1 text-sm text-neutral-700">
                    {order.items?.map((item) => (
                      <li key={item.id}>
                        {item.quantity}x {item.product_name}{" "}
                        <span className="text-neutral-500">({item.unit_price_label})</span>
                      </li>
                    ))}
                  </ul>

                  {order.shipping_address && (
                    <p className="mt-3 text-sm text-neutral-600">
                      <span className="font-medium text-neutral-500">Envío:</span>{" "}
                      {order.shipping_address}
                    </p>
                  )}
                  {order.customer_notes && (
                    <p className="mt-2 text-sm text-neutral-600">
                      <span className="font-medium text-neutral-500">Notas:</span>{" "}
                      {order.customer_notes}
                    </p>
                  )}

                  <p className="mt-3 text-xs font-medium text-violet-700">
                    Estado: {getStoreOrderStatusLabel(order.status)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
