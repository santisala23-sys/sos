"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Package, Plus } from "lucide-react";
import type { QrProductBatchRow } from "@/lib/db/queries-activation";
import { formatDateTime } from "@/lib/utils/format";

export function AdminProductBatchesPanel() {
  const [batches, setBatches] = useState<QrProductBatchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [productLabel, setProductLabel] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/product-batches");
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/product-batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_name: partnerName,
          product_label: productLabel || undefined,
          quantity,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al crear lote");
        return;
      }
      setPartnerName("");
      setProductLabel("");
      setQuantity(10);
      setNotes("");
      await load();
    } catch {
      setError("Error de conexión");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
      >
        <div className="flex items-center gap-2 text-white">
          <Plus className="h-5 w-5 text-violet-400" aria-hidden />
          <h2 className="text-lg font-bold">Nuevo lote de activación</h2>
        </div>
        <p className="mt-1 text-sm text-neutral-400">
          Genera códigos únicos y URLs para imprenta. Exportá CSV por lote.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-neutral-300">
            Partner / marca *
            <input
              required
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-white focus:border-violet-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm text-neutral-300">
            Producto / etiqueta
            <input
              value={productLabel}
              onChange={(e) => setProductLabel(e.target.value)}
              placeholder="Ej. Chaqueta kids invierno 2026"
              className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-white focus:border-violet-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm text-neutral-300">
            Cantidad (máx. 500)
            <input
              type="number"
              min={1}
              max={500}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-white focus:border-violet-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm text-neutral-300 sm:col-span-2">
            Notas internas
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-white focus:border-violet-500 focus:outline-none"
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={creating}
          className="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
        >
          {creating ? "Generando..." : "Crear lote"}
        </button>
      </form>

      <div>
        <div className="mb-4 flex items-center gap-2 text-neutral-300">
          <Package className="h-5 w-5" aria-hidden />
          <h2 className="font-semibold">Lotes existentes</h2>
        </div>

        {loading ? (
          <p className="text-neutral-500">Cargando lotes...</p>
        ) : batches.length === 0 ? (
          <p className="text-neutral-500">Todavía no hay lotes creados.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-neutral-800 bg-neutral-900/80 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Cant.</th>
                  <th className="px-4 py-3">Sin activar</th>
                  <th className="px-4 py-3">Activados</th>
                  <th className="px-4 py-3">Creado</th>
                  <th className="px-4 py-3">CSV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {batches.map((batch) => (
                  <tr key={batch.id} className="text-neutral-200">
                    <td className="px-4 py-3 font-medium">{batch.partner_name}</td>
                    <td className="px-4 py-3 text-neutral-400">
                      {batch.product_label ?? "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{batch.quantity}</td>
                    <td className="px-4 py-3 tabular-nums text-amber-300">
                      {batch.unclaimed_count}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-green-400">
                      {batch.claimed_count}
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {formatDateTime(batch.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/api/admin/product-batches/${batch.id}?format=csv`}
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 px-2.5 py-1 text-xs text-violet-300 hover:bg-neutral-800"
                      >
                        <Download className="h-3 w-3" aria-hidden />
                        Exportar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
