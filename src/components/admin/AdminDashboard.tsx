"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Globe,
  Package,
  Pencil,
  QrCode,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  Users,
} from "lucide-react";
import type {
  AdminOverviewStats,
  AdminTimeSeriesPoint,
  AdminTopEndpoint,
  AdminStatusBreakdown,
  AdminUserRow,
  AdminProfileRow,
  AdminScanRow,
  ApiRequestLogRow,
  SecurityAuditRow,
} from "@/lib/db/queries";
import { formatDateTime } from "@/lib/utils/format";
import {
  AdminDetailPanel,
  type AdminDetailTarget,
} from "@/components/admin/AdminDetailPanel";
import { AdminProductBatchesPanel } from "@/components/admin/AdminProductBatchesPanel";

type AdminTab =
  | "overview"
  | "users"
  | "profiles"
  | "batches"
  | "activity"
  | "api"
  | "security";

function StatCard({
  label,
  value,
  sub,
  accent = "violet",
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "violet" | "red" | "green" | "amber" | "blue";
}) {
  const colors = {
    violet: "border-violet-500/30 bg-violet-950/40 text-violet-200",
    red: "border-red-500/30 bg-red-950/40 text-red-200",
    green: "border-green-500/30 bg-green-950/40 text-green-200",
    amber: "border-amber-500/30 bg-amber-950/40 text-amber-200",
    blue: "border-blue-500/30 bg-blue-950/40 text-blue-200",
  };

  return (
    <div className={`rounded-2xl border p-5 ${colors[accent]}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
    </div>
  );
}

function MiniBarChart({
  data,
  label,
}: {
  data: AdminTimeSeriesPoint[];
  label: string;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <p className="mb-4 text-sm font-semibold text-neutral-300">{label}</p>
      <div className="flex h-32 items-end gap-1">
        {data.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin datos aún</p>
        ) : (
          data.map((point) => (
            <div
              key={point.bucket}
              className="group relative flex flex-1 flex-col items-center"
            >
              <div
                className="w-full rounded-t bg-violet-600 transition-all group-hover:bg-violet-500"
                style={{ height: `${Math.max(4, (point.count / max) * 100)}%` }}
                title={`${point.bucket}: ${point.count}`}
              />
              <span className="mt-1 hidden text-[9px] text-neutral-500 sm:block">
                {point.bucket.slice(-5)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-800">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-neutral-800 bg-neutral-900/80 text-xs uppercase tracking-wide text-neutral-400">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/80">{children}</tbody>
      </table>
    </div>
  );
}

function StatusBadge({ code }: { code: number }) {
  const color =
    code >= 500
      ? "bg-red-900/60 text-red-300"
      : code >= 400
        ? "bg-amber-900/60 text-amber-300"
        : "bg-green-900/60 text-green-300";
  return (
    <span className={`rounded px-2 py-0.5 font-mono text-xs ${color}`}>
      {code}
    </span>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 px-2.5 py-1 text-xs text-violet-300 hover:bg-neutral-800 hover:text-violet-200"
    >
      <Pencil className="h-3 w-3" />
      Gestionar
    </button>
  );
}

function filterRows<T>(rows: T[], query: string, keys: (keyof T)[]): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    keys.some((key) => String(row[key] ?? "").toLowerCase().includes(q)),
  );
}

export function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [scanSeries, setScanSeries] = useState<AdminTimeSeriesPoint[]>([]);
  const [apiSeries, setApiSeries] = useState<AdminTimeSeriesPoint[]>([]);
  const [topEndpoints, setTopEndpoints] = useState<AdminTopEndpoint[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<AdminStatusBreakdown[]>([]);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [scanLogs, setScanLogs] = useState<AdminScanRow[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiRequestLogRow[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditRow[]>([]);
  const [apiErrorsOnly, setApiErrorsOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<AdminDetailTarget | null>(null);

  const loadOverview = useCallback(async () => {
    const res = await fetch("/api/admin/stats");
    if (res.ok) {
      const data = await res.json();
      setOverview(data.overview);
      setScanSeries(data.scanSeries ?? []);
      setApiSeries(data.apiSeries ?? []);
      setTopEndpoints(data.topEndpoints ?? []);
      setStatusBreakdown(data.statusBreakdown ?? []);
    }
  }, []);

  const loadTab = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "overview") {
        await loadOverview();
      } else if (tab === "users") {
        const res = await fetch("/api/admin/users");
        if (res.ok) setUsers((await res.json()).users ?? []);
      } else if (tab === "profiles") {
        const res = await fetch("/api/admin/profiles");
        if (res.ok) setProfiles((await res.json()).profiles ?? []);
      } else if (tab === "activity") {
        const res = await fetch("/api/admin/scan-logs");
        if (res.ok) setScanLogs((await res.json()).logs ?? []);
      } else if (tab === "api") {
        const res = await fetch(
          `/api/admin/api-logs?errors=${apiErrorsOnly ? "1" : "0"}`,
        );
        if (res.ok) setApiLogs((await res.json()).logs ?? []);
      } else if (tab === "security") {
        const res = await fetch("/api/admin/security-logs");
        if (res.ok) setSecurityLogs((await res.json()).logs ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [tab, apiErrorsOnly, loadOverview]);

  useEffect(() => {
    loadTab();
    const interval = setInterval(() => {
      if (tab === "overview") loadOverview();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadTab, tab, loadOverview]);

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "users", label: "Usuarios", icon: <Users className="h-4 w-4" /> },
    { id: "profiles", label: "Perfiles QR", icon: <QrCode className="h-4 w-4" /> },
    { id: "batches", label: "Lotes QR", icon: <Package className="h-4 w-4" /> },
    { id: "activity", label: "Escaneos", icon: <Activity className="h-4 w-4" /> },
    { id: "api", label: "API & Errores", icon: <Server className="h-4 w-4" /> },
    { id: "security", label: "Seguridad", icon: <ShieldAlert className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Panel de control</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Métricas, usuarios, API, errores y auditoría de seguridad en tiempo real.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadTab()}
          className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-800"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      <nav className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setSearch("");
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-violet-600 text-white"
                : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>

      {tab !== "overview" && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en esta tabla..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-violet-500 focus:outline-none"
          />
        </div>
      )}

      {loading && tab !== "overview" && (
        <p className="text-neutral-500">Cargando...</p>
      )}

      {tab === "overview" && overview && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Usuarios" value={overview.totalUsers} accent="blue" />
            <StatCard
              label="Perfiles QR"
              value={overview.activeProfiles}
              sub={`${overview.totalProfiles} total`}
              accent="violet"
            />
            <StatCard
              label="Escaneos (24h)"
              value={overview.scansToday}
              sub={`${overview.scansWeek} esta semana`}
              accent="green"
            />
            <StatCard
              label="Alertas SOS"
              value={overview.sosCount}
              sub={`${overview.unreadScans} sin leer`}
              accent="red"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="API requests (24h)"
              value={overview.apiRequests24h}
              accent="blue"
            />
            <StatCard
              label="Errores API (24h)"
              value={overview.apiErrors24h}
              accent="amber"
            />
            <StatCard
              label="Eventos seguridad (24h)"
              value={overview.securityEvents24h}
              accent="red"
            />
            <StatCard
              label="Push subscriptions"
              value={overview.pushSubscriptions}
              accent="violet"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <MiniBarChart data={scanSeries} label="Escaneos por día (14 días)" />
            <MiniBarChart data={apiSeries} label="Requests API por hora (24h)" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
              <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-300">
                <Globe className="h-4 w-4" />
                Top endpoints (24h)
              </p>
              <div className="space-y-2">
                {topEndpoints.map((ep) => (
                  <div
                    key={ep.path}
                    className="flex items-center justify-between rounded-lg bg-neutral-950 px-3 py-2 text-sm"
                  >
                    <code className="truncate text-violet-300">{ep.path}</code>
                    <div className="flex shrink-0 items-center gap-3 tabular-nums">
                      <span className="text-neutral-300">{ep.count}</span>
                      {ep.error_count > 0 && (
                        <span className="text-xs text-red-400">
                          {ep.error_count} err
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {topEndpoints.length === 0 && (
                  <p className="text-sm text-neutral-500">Sin tráfico registrado</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
              <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-300">
                <AlertTriangle className="h-4 w-4" />
                Códigos HTTP (24h)
              </p>
              <div className="flex flex-wrap gap-2">
                {statusBreakdown.map((s) => (
                  <div
                    key={s.status_code}
                    className="flex items-center gap-2 rounded-lg bg-neutral-950 px-3 py-2"
                  >
                    <StatusBadge code={s.status_code} />
                    <span className="tabular-nums text-neutral-300">{s.count}</span>
                  </div>
                ))}
                {statusBreakdown.length === 0 && (
                  <p className="text-sm text-neutral-500">Sin datos</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "users" && !loading && (
        <DataTable headers={["Email", "Nombre", "Perfiles", "Escaneos", "Admin", "Registro", ""]}>
          {filterRows(users, search, ["email", "full_name"]).map((u) => (
            <tr key={u.id} className="hover:bg-neutral-900/50">
              <td className="px-4 py-3 font-mono text-xs text-violet-300">{u.email}</td>
              <td className="px-4 py-3">{u.full_name ?? "—"}</td>
              <td className="px-4 py-3 tabular-nums">{u.profile_count}</td>
              <td className="px-4 py-3 tabular-nums">{u.scan_count}</td>
              <td className="px-4 py-3">
                {u.is_admin ? (
                  <span className="rounded bg-violet-900/60 px-2 py-0.5 text-xs text-violet-300">
                    admin
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-xs text-neutral-500">
                {formatDateTime(u.created_at)}
              </td>
              <td className="px-4 py-3">
                <EditButton onClick={() => setDetail({ type: "user", id: u.id })} />
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      {tab === "profiles" && !loading && (
        <DataTable headers={["Beneficiario", "Slug", "Tutor", "Tipo", "Escaneos", "Estado", "Creado", ""]}>
          {filterRows(profiles, search, [
            "beneficiary_name",
            "slug",
            "tutor_email",
          ]).map((p) => (
            <tr key={p.id} className="hover:bg-neutral-900/50">
              <td className="px-4 py-3 font-medium">{p.beneficiary_name}</td>
              <td className="px-4 py-3 font-mono text-xs text-violet-300">/p/{p.slug}</td>
              <td className="px-4 py-3 text-xs text-neutral-400">{p.tutor_email}</td>
              <td className="px-4 py-3">{p.profile_type}</td>
              <td className="px-4 py-3 tabular-nums">{p.scan_count}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    p.is_active
                      ? "bg-green-900/50 text-green-300"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {p.is_active ? "activo" : "inactivo"}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-neutral-500">
                {formatDateTime(p.created_at)}
              </td>
              <td className="px-4 py-3">
                <EditButton onClick={() => setDetail({ type: "profile", id: p.id })} />
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      {tab === "batches" && <AdminProductBatchesPanel />}

      {tab === "activity" && !loading && (
        <DataTable headers={["Beneficiario", "Tipo", "Tutor", "Ubicación", "Leído", "Fecha", ""]}>
          {filterRows(scanLogs, search, [
            "beneficiary_name",
            "tutor_email",
            "slug",
          ]).map((log) => (
            <tr key={log.id} className="hover:bg-neutral-900/50">
              <td className="px-4 py-3">{log.beneficiary_name}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
                    log.alert_type === "sos"
                      ? "bg-red-900/60 text-red-300"
                      : "bg-neutral-800 text-neutral-300"
                  }`}
                >
                  {log.alert_type}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-neutral-400">{log.tutor_email}</td>
              <td className="px-4 py-3 text-xs">
                {log.latitude != null
                  ? `${Number(log.latitude).toFixed(4)}, ${Number(log.longitude).toFixed(4)}`
                  : "—"}
              </td>
              <td className="px-4 py-3">
                {log.read_at ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <span className="text-amber-400">●</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-neutral-500">
                {formatDateTime(log.scanned_at)}
              </td>
              <td className="px-4 py-3">
                <EditButton onClick={() => setDetail({ type: "scan", id: log.id })} />
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      {tab === "api" && !loading && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-neutral-400">
            <input
              type="checkbox"
              checked={apiErrorsOnly}
              onChange={(e) => setApiErrorsOnly(e.target.checked)}
              className="rounded border-neutral-600"
            />
            Solo errores (4xx / 5xx)
          </label>
          <DataTable headers={["Método", "Ruta", "Status", "Duración", "Error", "Fecha"]}>
            {apiLogs.map((log) => (
              <tr key={log.id} className="hover:bg-neutral-900/50">
                <td className="px-4 py-3 font-mono text-xs">{log.method}</td>
                <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-violet-300">
                  {log.path}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge code={log.status_code} />
                </td>
                <td className="px-4 py-3 tabular-nums text-xs">{log.duration_ms}ms</td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-red-400">
                  {log.error_message ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs text-neutral-500">
                  {formatDateTime(log.created_at)}
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {tab === "security" && !loading && (
        <DataTable headers={["Evento", "Usuario", "IP (hash)", "Detalles", "Fecha"]}>
          {securityLogs.map((log) => (
            <tr key={log.id} className="hover:bg-neutral-900/50">
              <td className="px-4 py-3">
                <span className="rounded bg-red-950/60 px-2 py-0.5 font-mono text-xs text-red-300">
                  {log.event_type}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-neutral-400">
                {log.user_id?.slice(0, 8) ?? "—"}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                {log.ip_hash?.slice(0, 12) ?? "—"}
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-xs text-neutral-400">
                {log.details ? JSON.stringify(log.details) : "—"}
              </td>
              <td className="px-4 py-3 text-xs text-neutral-500">
                {formatDateTime(log.created_at)}
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <AdminDetailPanel
        target={detail}
        onClose={() => setDetail(null)}
        onUpdated={loadTab}
      />
    </div>
  );
}
