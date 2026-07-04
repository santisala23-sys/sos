"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Package,
  Plus,
  RefreshCw,
} from "lucide-react";
import type {
  ActivationStats,
  QrActivationRow,
  QrProductBatchRow,
} from "@/lib/db/queries-activation";
import { formatDateTime } from "@/lib/utils/format";

function StatCard({
  label,
  value,
  sub,
  accent = "violet",
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "violet" | "green" | "amber" | "neutral";
}) {
  const colors = {
    violet: "border-violet-500/30 bg-violet-950/40 text-violet-200",
    green: "border-green-500/30 bg-green-950/40 text-green-200",
    amber: "border-amber-500/30 bg-amber-950/40 text-amber-200",
    neutral: "border-neutral-600/40 bg-neutral-900/60 text-neutral-200",
  };

  return (
    <div className={`rounded-2xl border p-4 ${colors[accent]}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs opacity-60">{sub}</p>}
    </div>
  );
}

function ActivationProgress({
  claimed,
  total,
}: {
  claimed: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((claimed / total) * 100) : 0;

  return (
    <div className="min-w-[120px]">
      <div className="mb-1 flex items-center justify-between text-xs tabular-nums">
        <span className="text-green-400">{claimed} activos</span>
        <span className="text-neutral-500">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: QrActivationRow["status"] }) {
  const styles = {
    unclaimed: "bg-amber-950 text-amber-300 border-amber-800/60",
    claimed: "bg-green-950 text-green-300 border-green-800/60",
    disabled: "bg-neutral-800 text-neutral-400 border-neutral-700",
  };
  const labels = {
    unclaimed: "Sin activar",
    claimed: "Activado",
    disabled: "Deshabilitado",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function AdminProductBatchesPanel() {
  const [batches, setBatches] = useState<QrProductBatchRow[]>([]);
  const [stats, setStats] = useState<ActivationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [productLabel, setProductLabel] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState("");
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [batchActivations, setBatchActivations] = useState<
    Record<string, QrActivationRow[]>
  >({});
  const [loadingBatchId, setLoadingBatchId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/product-batches");
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches ?? []);
        setStats(data.stats ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleBatchDetail(batchId: string) {
    if (expandedBatchId === batchId) {
      setExpandedBatchId(null);
      return;
    }

    setExpandedBatchId(batchId);

    if (batchActivations[batchId]) return;

    setLoadingBatchId(batchId);
    try {
      const res = await fetch(`/api/admin/product-batches/${batchId}`);
      if (res.ok) {
        const data = await res.json();
        setBatchActivations((prev) => ({
          ...prev,
          [batchId]: data.activations ?? [],
        }));
      }
    } finally {
      setLoadingBatchId(null);
    }
  }

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
      setExpandedBatchId(null);
      setBatchActivations({});
      await load();
    } catch {
      setError("Error de conexión");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      {stats && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Resumen general
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Códigos generados"
              value={stats.total_codes}
              sub={`${stats.batch_count} lote${stats.batch_count === 1 ? "" : "s"}`}
              accent="violet"
            />
            <StatCard
              label="Activados"
              value={stats.claimed}
              sub={`${stats.activation_rate}% del total`}
              accent="green"
            />
            <StatCard
              label="Sin activar"
              value={stats.unclaimed}
              sub="Stock / pendientes"
              accent="amber"
            />
            <StatCard
              label="Deshabilitados"
              value={stats.disabled}
              sub="Códigos anulados"
              accent="neutral"
            />
          </div>
        </section>
      )}

      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
      >
        <div className="flex items-center gap-2 text-white">
          <Plus className="h-5 w-5 text-violet-400" aria-hidden />
          <h2 className="text-lg font-bold">Nuevo lote de activación</h2>
        </div>
        <p className="mt-1 text-sm text-neutral-400">
          Genera códigos únicos y URLs para imprenta. Descargá{" "}
          <strong className="font-medium text-neutral-300">Imprenta (ZIP)</strong> con PNG,
          SVG y manifest listos para la gráfica.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-neutral-300">
            Partner / marca *
            <input
              required
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="Ej. Stock propio"
              className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-white focus:border-violet-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm text-neutral-300">
            Producto / etiqueta
            <input
              value={productLabel}
              onChange={(e) => setProductLabel(e.target.value)}
              placeholder="Ej. Llavero QR, Credencial plastificada"
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
              placeholder="Ej. Imprenta X, entrega marzo 2026"
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
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-neutral-300">
            <Package className="h-5 w-5" aria-hidden />
            <h2 className="font-semibold">Lotes existentes</h2>
          </div>
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
            Actualizar
          </button>
        </div>

        {loading && batches.length === 0 ? (
          <p className="text-neutral-500">Cargando lotes...</p>
        ) : batches.length === 0 ? (
          <p className="text-neutral-500">Todavía no hay lotes creados.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-800">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-neutral-800 bg-neutral-900/80 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="w-8 px-2 py-3" aria-hidden />
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Generados</th>
                  <th className="px-4 py-3">Progreso</th>
                  <th className="px-4 py-3">Sin activar</th>
                  <th className="px-4 py-3">Activados</th>
                  <th className="px-4 py-3">Creado</th>
                  <th className="px-4 py-3">Exportar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {batches.map((batch) => {
                  const isExpanded = expandedBatchId === batch.id;
                  const activations = batchActivations[batch.id] ?? [];

                  return (
                    <Fragment key={batch.id}>
                      <tr
                        className="cursor-pointer text-neutral-200 hover:bg-neutral-900/50"
                        onClick={() => toggleBatchDetail(batch.id)}
                      >
                        <td className="px-2 py-3 text-neutral-500">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" aria-hidden />
                          ) : (
                            <ChevronRight className="h-4 w-4" aria-hidden />
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">{batch.partner_name}</td>
                        <td className="px-4 py-3 text-neutral-400">
                          {batch.product_label ?? "—"}
                        </td>
                        <td className="px-4 py-3 tabular-nums">{batch.quantity}</td>
                        <td className="px-4 py-3">
                          <ActivationProgress
                            claimed={batch.claimed_count}
                            total={batch.quantity}
                          />
                        </td>
                        <td className="px-4 py-3 tabular-nums text-amber-300">
                          {batch.unclaimed_count}
                          {batch.disabled_count > 0 && (
                            <span className="ml-1 text-xs text-neutral-500">
                              (+{batch.disabled_count} off)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-green-400">
                          {batch.claimed_count}
                        </td>
                        <td className="px-4 py-3 text-neutral-400">
                          {formatDateTime(batch.created_at)}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-1.5">
                            <a
                              href={`/api/admin/product-batches/${batch.id}?format=zip`}
                              className="inline-flex items-center justify-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-500"
                            >
                              <Download className="h-3 w-3" aria-hidden />
                              Imprenta (ZIP)
                            </a>
                            <a
                              href={`/api/admin/product-batches/${batch.id}?format=csv`}
                              className="inline-flex items-center justify-center gap-1 rounded-lg border border-neutral-700 px-2.5 py-1 text-xs text-violet-300 hover:bg-neutral-800"
                            >
                              CSV
                            </a>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-neutral-950/60">
                          <td colSpan={9} className="px-4 py-4">
                            {loadingBatchId === batch.id ? (
                              <p className="text-sm text-neutral-500">
                                Cargando códigos del lote...
                              </p>
                            ) : activations.length === 0 ? (
                              <p className="text-sm text-neutral-500">
                                No hay códigos en este lote.
                              </p>
                            ) : (
                              <>
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                  <a
                                    href={`/api/admin/product-batches/${batch.id}?format=zip`}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500"
                                  >
                                    <Download className="h-3.5 w-3.5" aria-hidden />
                                    Descargar ZIP para imprenta
                                  </a>
                                  {batch.unclaimed_count < batch.quantity && (
                                    <a
                                      href={`/api/admin/product-batches/${batch.id}?format=zip&only_unclaimed=1`}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
                                    >
                                      Solo sin activar ({batch.unclaimed_count})
                                    </a>
                                  )}
                                  {batch.product_label && (
                                    <span className="text-xs text-neutral-500">
                                      Plantilla auto: {batch.product_label}
                                    </span>
                                  )}
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-neutral-800">
                                <table className="w-full min-w-[640px] text-left text-xs">
                                  <thead className="border-b border-neutral-800 bg-neutral-900/80 text-neutral-400">
                                    <tr>
                                      <th className="px-3 py-2">Código</th>
                                      <th className="px-3 py-2">Estado</th>
                                      <th className="px-3 py-2">Activado</th>
                                      <th className="px-3 py-2">Slug perfil</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-800/60">
                                    {activations.map((activation) => (
                                      <tr key={activation.id} className="text-neutral-300">
                                        <td className="px-3 py-2 font-mono font-medium">
                                          {activation.activation_code}
                                        </td>
                                        <td className="px-3 py-2">
                                          <StatusBadge status={activation.status} />
                                        </td>
                                        <td className="px-3 py-2 text-neutral-400">
                                          {activation.claimed_at
                                            ? formatDateTime(activation.claimed_at)
                                            : "—"}
                                        </td>
                                        <td className="px-3 py-2 font-mono text-neutral-500">
                                          {activation.public_slug ?? "—"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                </div>
                              </>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
