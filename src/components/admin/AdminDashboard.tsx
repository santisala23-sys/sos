"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Globe,
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
import { AdminLegalPanel } from "@/components/admin/AdminLegalPanel";
import { AdminMaintenancePanel } from "@/components/admin/AdminMaintenancePanel";
import { AdminPrintTemplatesPanel } from "@/components/admin/AdminPrintTemplatesPanel";
import { AdminProductBatchesPanel } from "@/components/admin/AdminProductBatchesPanel";
import { AdminStorePanel } from "@/components/admin/AdminStorePanel";
import {
  ADMIN_TABS,
  AdminSidebar,
  type AdminTab,
} from "@/components/admin/AdminSidebar";
import {
  AdminLoading,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusCode,
} from "@/components/admin/AdminUiParts";
import { adminUi } from "@/components/admin/adminUi";

function MiniBarChart({
  data,
  label,
}: {
  data: AdminTimeSeriesPoint[];
  label: string;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className={adminUi.card}>
      <p className={`mb-1 ${adminUi.cardTitle}`}>{label}</p>
      <p className="mb-4 text-xs text-neutral-500">Tendencia reciente</p>
      <div className="flex h-36 items-end gap-1.5 rounded-xl bg-gradient-to-t from-violet-50/80 to-transparent p-2 pt-4">
        {data.length === 0 ? (
          <p className="text-sm text-neutral-500">Sin datos aún</p>
        ) : (
          data.map((point) => (
            <div
              key={point.bucket}
              className="group relative flex flex-1 flex-col items-center"
            >
              <div
                className="w-full min-h-[4px] rounded-t-md bg-gradient-to-t from-violet-600 to-indigo-400 shadow-sm shadow-violet-500/20 transition-all group-hover:from-violet-500 group-hover:to-indigo-300"
                style={{ height: `${Math.max(6, (point.count / max) * 100)}%` }}
                title={`${point.bucket}: ${point.count}`}
              />
              <span className="mt-2 hidden text-[9px] font-medium text-neutral-400 sm:block">
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
    <div className={adminUi.tableWrap}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className={adminUi.tableHead}>
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">{children}</tbody>
      </table>
    </div>
  );
}

function StatusBadge({ code }: { code: number }) {
  return <AdminStatusCode code={code} />;
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={adminUi.editBtn}
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
  const [mobileOpen, setMobileOpen] = useState(false);
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
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    loadTab();
    const interval = setInterval(() => {
      if (tab === "overview") loadOverview();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadTab, tab, loadOverview]);

  const activeTab = ADMIN_TABS.find((item) => item.id === tab);
  const pageTitle =
    tab === "overview" ? "Estadísticas" : (activeTab?.label ?? "Administración");
  const pageDescription =
    tab === "overview"
      ? "Métricas en tiempo real de usuarios, escaneos, API y alertas."
      : "Gestioná usuarios, tienda, plantillas, escaneos y auditoría de seguridad.";
  const showSearch =
    tab !== "overview" &&
    tab !== "templates" &&
    tab !== "batches" &&
    tab !== "store" &&
    tab !== "legal" &&
    tab !== "maintenance";

  return (
    <div className={adminUi.shell}>
      <AdminSidebar
        tab={tab}
        onTabChange={(nextTab) => {
          setTab(nextTab);
          setSearch("");
        }}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      <main className={adminUi.main}>
        <div className={adminUi.page}>
          <AdminPageHeader
            title={pageTitle}
            description={pageDescription}
            actions={
              <button
                type="button"
                onClick={() => loadTab()}
                className={adminUi.refreshBtn}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </button>
            }
          />

          {showSearch && (
            <div className={adminUi.toolbar}>
              <div className="relative min-w-[min(100%,20rem)] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar en esta tabla..."
                  className={adminUi.input}
                />
              </div>
            </div>
          )}

      {loading && showSearch && <AdminLoading />}

      {tab === "overview" && overview && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              label="Usuarios"
              value={overview.totalUsers}
              accent="blue"
              icon={<Users className="h-5 w-5" />}
            />
            <AdminStatCard
              label="Perfiles QR"
              value={overview.activeProfiles}
              sub={`${overview.totalProfiles} total`}
              accent="violet"
              icon={<QrCode className="h-5 w-5" />}
            />
            <AdminStatCard
              label="Escaneos (24h)"
              value={overview.scansToday}
              sub={`${overview.scansWeek} esta semana`}
              accent="green"
              icon={<Activity className="h-5 w-5" />}
            />
            <AdminStatCard
              label="Alertas SOS"
              value={overview.sosCount}
              sub={`${overview.unreadScans} sin leer`}
              accent="red"
              icon={<AlertTriangle className="h-5 w-5" />}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              label="API requests (24h)"
              value={overview.apiRequests24h}
              accent="blue"
              icon={<Server className="h-5 w-5" />}
            />
            <AdminStatCard
              label="Errores API (24h)"
              value={overview.apiErrors24h}
              accent="amber"
              icon={<AlertTriangle className="h-5 w-5" />}
            />
            <AdminStatCard
              label="Eventos seguridad (24h)"
              value={overview.securityEvents24h}
              accent="red"
              icon={<ShieldAlert className="h-5 w-5" />}
            />
            <AdminStatCard
              label="Push subscriptions"
              value={overview.pushSubscriptions}
              accent="violet"
              icon={<Bell className="h-5 w-5" />}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <MiniBarChart data={scanSeries} label="Escaneos por día (14 días)" />
            <MiniBarChart data={apiSeries} label="Requests API por hora (24h)" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className={adminUi.card}>
              <p className={`mb-4 flex items-center gap-2 ${adminUi.cardTitle}`}>
                <Globe className="h-4 w-4 text-violet-600" />
                Top endpoints (24h)
              </p>
              <div className="space-y-2">
                {topEndpoints.map((ep) => (
                  <div
                    key={ep.path}
                    className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/80 px-3 py-2.5 text-sm transition-colors hover:border-violet-100 hover:bg-violet-50/50"
                  >
                    <code className="truncate font-mono text-xs text-violet-700">{ep.path}</code>
                    <div className="flex shrink-0 items-center gap-3 tabular-nums">
                      <span className="font-medium text-neutral-800">{ep.count}</span>
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

            <div className={adminUi.card}>
              <p className={`mb-4 flex items-center gap-2 ${adminUi.cardTitle}`}>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Códigos HTTP (24h)
              </p>
              <div className="flex flex-wrap gap-2">
                {statusBreakdown.map((s) => (
                  <div
                    key={s.status_code}
                    className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-50/80 px-3 py-2"
                  >
                    <StatusBadge code={s.status_code} />
                    <span className="tabular-nums font-medium text-neutral-800">{s.count}</span>
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
            <tr key={u.id} className={adminUi.tableRow}>
              <td className={`${adminUi.tableCell} font-mono text-xs text-violet-700`}>{u.email}</td>
              <td className="px-4 py-3">{u.full_name ?? "—"}</td>
              <td className="px-4 py-3 tabular-nums">{u.profile_count}</td>
              <td className="px-4 py-3 tabular-nums">{u.scan_count}</td>
              <td className="px-4 py-3">
                {u.is_admin ? (
                  <span className="rounded bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">
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
            <tr key={p.id} className={adminUi.tableRow}>
              <td className={`${adminUi.tableCell} font-medium`}>{p.beneficiary_name}</td>
              <td className={`${adminUi.tableCell} font-mono text-xs text-violet-700`}>/p/{p.slug}</td>
              <td className="px-4 py-3 text-xs text-neutral-400">{p.tutor_email}</td>
              <td className="px-4 py-3">{p.profile_type}</td>
              <td className="px-4 py-3 tabular-nums">{p.scan_count}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    p.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-neutral-100 text-neutral-500"
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

      {tab === "templates" && <AdminPrintTemplatesPanel />}

      {tab === "batches" && <AdminProductBatchesPanel />}

      {tab === "store" && <AdminStorePanel />}

      {tab === "activity" && !loading && (
        <DataTable headers={["Beneficiario", "Tipo", "Tutor", "Ubicación", "Leído", "Fecha", ""]}>
          {filterRows(scanLogs, search, [
            "beneficiary_name",
            "tutor_email",
            "slug",
          ]).map((log) => (
            <tr key={log.id} className={adminUi.tableRow}>
              <td className="px-4 py-3">{log.beneficiary_name}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${
                    log.alert_type === "sos"
                      ? "bg-red-100 text-red-800"
                      : "bg-neutral-100 text-neutral-600"
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
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={apiErrorsOnly}
              onChange={(e) => setApiErrorsOnly(e.target.checked)}
              className="rounded border-neutral-300 text-violet-600 focus:ring-violet-500"
            />
            Solo errores (4xx / 5xx)
          </label>
          <DataTable headers={["Método", "Ruta", "Status", "Duración", "Error", "Fecha"]}>
            {apiLogs.map((log) => (
              <tr key={log.id} className={adminUi.tableRow}>
                <td className="px-4 py-3 font-mono text-xs">{log.method}</td>
                <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-violet-700">
                  {log.path}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge code={log.status_code} />
                </td>
                <td className="px-4 py-3 tabular-nums text-xs">{log.duration_ms}ms</td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-red-600">
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
            <tr key={log.id} className={adminUi.tableRow}>
              <td className="px-4 py-3">
                <span className="rounded bg-red-100 px-2 py-0.5 font-mono text-xs font-semibold text-red-800">
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

      {tab === "legal" && <AdminLegalPanel />}
      {tab === "maintenance" && <AdminMaintenancePanel />}

      <AdminDetailPanel
        target={detail}
        onClose={() => setDetail(null)}
        onUpdated={loadTab}
      />
        </div>
      </main>
    </div>
  );
}
