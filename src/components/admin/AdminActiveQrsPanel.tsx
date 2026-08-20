"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  Package,
  PawPrint,
  Pencil,
  QrCode,
  Search,
  User,
} from "lucide-react";
import {
  EXPORT_TEMPLATES,
  type ExportTemplateKey,
} from "@/lib/activation/export-templates";
import type { AdminProfileRow } from "@/lib/db/queries";
import { PROFILE_TYPES, type ProfileType } from "@/lib/profile-types";
import { formatDateTime } from "@/lib/utils/format";
import { getPublicProfileUrl } from "@/lib/utils/slug";
import { AdminLoading, AdminStatCard } from "@/components/admin/AdminUiParts";
import { adminUi } from "@/components/admin/adminUi";

type StatusFilter = "active" | "inactive" | "all";
type SourceFilter = "all" | "product" | "digital";

type AdminActiveQrsPanelProps = {
  onManage: (profileId: string) => void;
};

const TEMPLATE_OPTIONS = Object.entries(EXPORT_TEMPLATES) as [
  ExportTemplateKey,
  (typeof EXPORT_TEMPLATES)[ExportTemplateKey],
][];

function TypeBadge({ type }: { type: ProfileType }) {
  const option = PROFILE_TYPES.find((item) => item.value === type);
  const Icon =
    type === "pet" ? PawPrint : type === "object" ? Package : User;
  const styles = {
    person: "bg-violet-100 text-violet-800 border-violet-200",
    pet: "bg-amber-100 text-amber-900 border-amber-200",
    object: "bg-sky-100 text-sky-800 border-sky-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${styles[type]}`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {option?.label ?? type}
    </span>
  );
}

export function AdminActiveQrsPanel({ onManage }: AdminActiveQrsPanelProps) {
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [profileType, setProfileType] = useState<"" | ProfileType>("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [formatById, setFormatById] = useState<Record<string, ExportTemplateKey>>(
    {},
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "500" });
      if (status === "active") params.set("is_active", "1");
      if (status === "inactive") params.set("is_active", "0");
      if (profileType) params.set("profile_type", profileType);
      if (source !== "all") params.set("source", source);
      if (search.trim()) params.set("q", search.trim());

      const res = await fetch(`/api/admin/profiles?${params}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudieron cargar los QRs");
      }
      const data = await res.json();
      setProfiles(data.profiles ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [status, profileType, source, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, search ? 280 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const stats = useMemo(() => {
    const active = profiles.filter((p) => p.is_active).length;
    const product = profiles.filter((p) => p.activation_code).length;
    const byType = {
      person: profiles.filter((p) => p.profile_type === "person").length,
      pet: profiles.filter((p) => p.profile_type === "pet").length,
      object: profiles.filter((p) => p.profile_type === "object").length,
    };
    return { total: profiles.length, active, product, byType };
  }, [profiles]);

  function getFormat(profile: AdminProfileRow): ExportTemplateKey {
    return formatById[profile.id] ?? "minimal";
  }

  async function downloadQr(profile: AdminProfileRow, output: "png" | "svg") {
    const template = getFormat(profile);
    setDownloadingId(profile.id);
    try {
      const res = await fetch(
        `/api/admin/profiles/${profile.id}/export?template=${template}&output=${output}`,
      );
      if (!res.ok) throw new Error("No se pudo exportar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sos-qr-${profile.slug.slice(0, 12)}-${template}.${output}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Error al descargar el QR");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="En esta vista"
          value={stats.total}
          sub={`${stats.active} activos`}
          accent="violet"
          icon={<QrCode className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Producto físico"
          value={stats.product}
          sub="Con etiqueta / lote"
          accent="blue"
          icon={<Package className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Personas"
          value={stats.byType.person}
          accent="violet"
          icon={<User className="h-5 w-5" />}
        />
        <AdminStatCard
          label="Mascotas / objetos"
          value={stats.byType.pet + stats.byType.object}
          sub={`${stats.byType.pet} mascotas · ${stats.byType.object} objetos`}
          accent="amber"
          icon={<PawPrint className="h-5 w-5" />}
        />
      </div>

      <div className={`${adminUi.toolbar} flex-col items-stretch gap-3 sm:flex-row sm:items-center`}>
        <div className="relative min-w-[min(100%,18rem)] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tutor, email, beneficiario, tag, código…"
            className={adminUi.input}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className={adminUi.inputPlain}
            aria-label="Filtrar por estado"
          >
            <option value="active">Solo activos</option>
            <option value="inactive">Solo inactivos</option>
            <option value="all">Todos los estados</option>
          </select>

          <select
            value={profileType}
            onChange={(e) =>
              setProfileType(e.target.value as "" | ProfileType)
            }
            className={adminUi.inputPlain}
            aria-label="Filtrar por tipo"
          >
            <option value="">Todos los tipos</option>
            {PROFILE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value as SourceFilter)}
            className={adminUi.inputPlain}
            aria-label="Filtrar por origen"
          >
            <option value="all">Todos los orígenes</option>
            <option value="product">Producto / etiqueta</option>
            <option value="digital">Digital (sin lote)</option>
          </select>
        </div>
      </div>

      {error && <p className={adminUi.alertError}>{error}</p>}
      {loading && <AdminLoading />}

      {!loading && profiles.length === 0 && (
        <p className={adminUi.empty}>No hay QRs con estos filtros.</p>
      )}

      {!loading && profiles.length > 0 && (
        <div className={adminUi.tableWrap}>
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className={adminUi.tableHead}>
              <tr>
                <th className="px-4 py-3 font-semibold">Beneficiario</th>
                <th className="px-4 py-3 font-semibold">Tutor</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Tag</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Formato</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {profiles.map((p) => (
                <tr key={p.id} className={adminUi.tableRow}>
                  <td className={`${adminUi.tableCell} font-medium`}>
                    <div>{p.beneficiary_name}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-violet-600">
                      /p/{p.slug.slice(0, 14)}
                      {p.slug.length > 14 ? "…" : ""}
                    </div>
                    <div className="mt-0.5 text-[11px] text-neutral-400">
                      {p.scan_count} escaneos · {formatDateTime(p.created_at)}
                    </div>
                  </td>
                  <td className={adminUi.tableCell}>
                    {p.tutor_name?.trim() || "—"}
                  </td>
                  <td className={`${adminUi.tableCell} font-mono text-xs text-violet-700`}>
                    {p.tutor_email}
                  </td>
                  <td className={adminUi.tableCell}>
                    {p.tag || p.partner_name ? (
                      <div>
                        <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800">
                          {p.tag ?? "Sin etiqueta"}
                        </span>
                        {p.partner_name && (
                          <div className="mt-1 text-[11px] text-neutral-500">
                            {p.partner_name}
                            {p.activation_code ? ` · ${p.activation_code}` : ""}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400">Digital</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={p.profile_type} />
                  </td>
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
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <select
                        value={getFormat(p)}
                        onChange={(e) =>
                          setFormatById((prev) => ({
                            ...prev,
                            [p.id]: e.target.value as ExportTemplateKey,
                          }))
                        }
                        className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-800"
                        aria-label={`Formato para ${p.beneficiary_name}`}
                      >
                        {TEMPLATE_OPTIONS.map(([key, tpl]) => (
                          <option key={key} value={key}>
                            {tpl.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={downloadingId === p.id}
                          onClick={() => downloadQr(p, "png")}
                          className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                        >
                          <Download className="h-3 w-3" />
                          PNG
                        </button>
                        <button
                          type="button"
                          disabled={downloadingId === p.id}
                          onClick={() => downloadQr(p, "svg")}
                          className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                        >
                          SVG
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onManage(p.id)}
                        className={adminUi.editBtn}
                      >
                        <Pencil className="h-3 w-3" />
                        Configurar
                      </button>
                      <a
                        href={getPublicProfileUrl(p.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-700 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ver público
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
