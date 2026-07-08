"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, Play, RotateCcw, UserX } from "lucide-react";
import { adminUi } from "@/components/admin/adminUi";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils/format";

type DeletionRow = {
  id: string;
  email: string;
  full_name: string | null;
  deletion_requested_at: string;
  deletion_scheduled_for: string | null;
  deleted_at: string | null;
  created_at: string;
};

type PurgeResult = {
  api_request_logs: number;
  security_audit_logs: number;
  scan_messages: number;
  scan_logs: number;
  accounts_anonymized: number;
};

export function AdminMaintenancePanel() {
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletions, setDeletions] = useState<DeletionRow[]>([]);
  const [lastPurge, setLastPurge] = useState<PurgeResult | null>(null);

  const pending = useMemo(
    () => deletions.filter((d) => !d.deleted_at),
    [deletions],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/maintenance");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo cargar");
      setDeletions(data.deletions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runPurgeNow() {
    const ok = confirm(
      "Esto ejecuta la purga de retención (logs antiguos) y procesa bajas vencidas. ¿Continuar?",
    );
    if (!ok) return;

    setRunning(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "purge_now" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo ejecutar");
      setLastPurge(data.purged ?? null);
      setSuccess("Purga ejecutada.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setRunning(false);
    }
  }

  async function cancelDeletion(userId: string) {
    const ok = confirm("¿Cancelar solicitud de baja para este usuario?");
    if (!ok) return;
    setActionLoading(`cancel:${userId}`);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel_deletion", userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "No se pudo cancelar");
      setSuccess("Baja cancelada.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setActionLoading(null);
    }
  }

  async function anonymizeNow(userId: string) {
    const ok = confirm(
      "Esto anonimiza la cuenta y elimina perfiles/push asociados. ¿Continuar?",
    );
    if (!ok) return;
    setActionLoading(`anonymize:${userId}`);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "anonymize_now", userId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "No se pudo anonimizar");
      setSuccess("Cuenta anonimizada.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <p className={adminUi.loading}>Cargando mantenimiento...</p>;

  return (
    <div className="space-y-6">
      <div className={adminUi.card}>
        <p className={`mb-2 flex items-center gap-2 ${adminUi.cardTitle}`}>
          <Clock className="h-4 w-4 text-violet-600" />
          Baja solicitada (gracia 30 días)
        </p>
        <p className="text-sm text-neutral-600">
          Una cuenta solo se anonimiza cuando el usuario solicita la baja y vence el plazo.{" "}
          <strong>No</strong> se elimina por inactividad.
        </p>

        {error && (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-3 text-sm text-green-700" role="status">
            {success}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={running}
            onClick={runPurgeNow}
            className="gap-2"
          >
            <Play className="h-4 w-4" aria-hidden />
            {running ? "Ejecutando..." : "Ejecutar purga ahora"}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={load} className="gap-2">
            <RotateCcw className="h-4 w-4" aria-hidden />
            Recargar
          </Button>
        </div>

        {lastPurge && (
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            <p className="font-semibold">Resultado último run</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>api_request_logs: {lastPurge.api_request_logs}</li>
              <li>security_audit_logs: {lastPurge.security_audit_logs}</li>
              <li>scan_logs: {lastPurge.scan_logs}</li>
              <li>scan_messages: {lastPurge.scan_messages}</li>
              <li>cuentas anonimizadas: {lastPurge.accounts_anonymized}</li>
            </ul>
          </div>
        )}
      </div>

      <div className={adminUi.card}>
        <p className={`mb-3 ${adminUi.cardTitle}`}>Solicitudes de baja</p>
        {pending.length === 0 ? (
          <p className="text-sm text-neutral-500">No hay bajas solicitadas.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((u) => (
              <div
                key={u.id}
                className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-violet-700">{u.email}</p>
                  <p className="mt-1 text-sm text-neutral-800">
                    {u.full_name ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Solicitó: {formatDateTime(u.deletion_requested_at)} · Vence:{" "}
                    {u.deletion_scheduled_for ? formatDateTime(u.deletion_scheduled_for) : "—"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={actionLoading === `cancel:${u.id}`}
                    onClick={() => cancelDeletion(u.id)}
                  >
                    Cancelar baja
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    className="gap-2"
                    disabled={actionLoading === `anonymize:${u.id}`}
                    onClick={() => anonymizeNow(u.id)}
                  >
                    <UserX className="h-4 w-4" aria-hidden />
                    Anonimizar ahora
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

