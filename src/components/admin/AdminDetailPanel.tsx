"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  ExternalLink,
  Loader2,
  MapPin,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import type { QrProfile, ScanMessage } from "@/types/database";
import type {
  AdminProfileRow,
  AdminScanDetail,
  AdminUserRow,
} from "@/lib/db/queries";
import { formatDateTime } from "@/lib/utils/format";
import { getPublicProfileUrl, getSosOnlyUrl } from "@/lib/utils/slug";
import { getGoogleMapsUrl } from "@/lib/alerts/send-alert";
import { adminUi } from "@/components/admin/adminUi";
import { Button } from "@/components/ui/Button";

export type AdminDetailTarget =
  | { type: "user"; id: string }
  | { type: "profile"; id: string }
  | { type: "scan"; id: string };

type AdminDetailPanelProps = {
  target: AdminDetailTarget | null;
  onClose: () => void;
  onUpdated: () => void;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass = adminUi.inputPlain;

export function AdminDetailPanel({
  target,
  onClose,
  onUpdated,
}: AdminDetailPanelProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [user, setUser] = useState<
    (AdminUserRow & { google_id: string | null }) | null
  >(null);
  const [userProfiles, setUserProfiles] = useState<QrProfile[]>([]);
  const [pushCount, setPushCount] = useState(0);
  const [userForm, setUserForm] = useState({ full_name: "", is_admin: false });

  const [profile, setProfile] = useState<AdminProfileRow | null>(null);
  const [profileForm, setProfileForm] = useState<Partial<AdminProfileRow>>({});

  const [scan, setScan] = useState<AdminScanDetail | null>(null);

  const load = useCallback(async () => {
    if (!target) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (target.type === "user") {
        const res = await fetch(`/api/admin/users/${target.id}`);
        if (!res.ok) throw new Error("No se pudo cargar el usuario");
        const data = await res.json();
        setUser(data.user);
        setUserProfiles(data.profiles ?? []);
        setPushCount(data.pushSubscriptionCount ?? 0);
        setUserForm({
          full_name: data.user.full_name ?? "",
          is_admin: Boolean(data.user.is_admin),
        });
      } else if (target.type === "profile") {
        const res = await fetch(`/api/admin/profiles/${target.id}`);
        if (!res.ok) throw new Error("No se pudo cargar el perfil");
        const data = await res.json();
        setProfile(data.profile);
        setProfileForm(data.profile);
      } else {
        const res = await fetch(`/api/admin/scan-logs/${target.id}`);
        if (!res.ok) throw new Error("No se pudo cargar el escaneo");
        const data = await res.json();
        setScan(data.log);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [target]);

  useEffect(() => {
    if (target) load();
    else {
      setUser(null);
      setProfile(null);
      setScan(null);
    }
  }, [target, load]);

  async function saveUser() {
    if (!target || target.type !== "user") return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/users/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al guardar");
      return;
    }
    setSuccess("Usuario actualizado");
    onUpdated();
    await load();
  }

  async function saveProfile() {
    if (!target || target.type !== "profile") return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/profiles/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Error al guardar");
      return;
    }
    setSuccess("Perfil actualizado");
    onUpdated();
    await load();
  }

  async function deleteProfile() {
    if (!target || target.type !== "profile") return;
    if (!confirm("¿Eliminar este perfil QR? Se borran también sus escaneos.")) {
      return;
    }
    setActionLoading("delete");
    const res = await fetch(`/api/admin/profiles/${target.id}`, {
      method: "DELETE",
    });
    setActionLoading(null);
    if (!res.ok) {
      setError("No se pudo eliminar");
      return;
    }
    onUpdated();
    onClose();
  }

  async function toggleProfileActive() {
    if (!target || target.type !== "profile" || !profile) return;
    setActionLoading("toggle");
    const res = await fetch(`/api/admin/profiles/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !profile.is_active }),
    });
    setActionLoading(null);
    if (!res.ok) {
      setError("Error al cambiar estado");
      return;
    }
    setSuccess(profile.is_active ? "Perfil desactivado" : "Perfil activado");
    onUpdated();
    await load();
  }

  async function toggleScanRead() {
    if (!target || target.type !== "scan" || !scan) return;
    setActionLoading("read");
    const res = await fetch(`/api/admin/scan-logs/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !scan.read_at }),
    });
    setActionLoading(null);
    if (!res.ok) {
      setError("Error al actualizar lectura");
      return;
    }
    setSuccess(scan.read_at ? "Marcado como no leído" : "Marcado como leído");
    onUpdated();
    await load();
  }

  async function resendAlert() {
    if (!target || target.type !== "scan") return;
    setActionLoading("resend");
    setError(null);
    const res = await fetch(`/api/admin/scan-logs/${target.id}/resend-alert`, {
      method: "POST",
    });
    setActionLoading(null);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Error al reenviar");
      return;
    }
    setSuccess(
      `Alerta reenviada (push a ${data.pushSubscriptionCount ?? 0} dispositivo(s))`,
    );
  }

  if (!target) return null;

  const title =
    target.type === "user"
      ? "Usuario"
      : target.type === "profile"
        ? "Perfil QR"
        : "Escaneo / evento";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className={adminUi.panelOverlay}
        onClick={onClose}
        aria-label="Cerrar panel"
      />
      <aside className={adminUi.panelAside}>
        <header className={adminUi.panelHeader}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
              Troubleshoot
            </p>
            <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className={adminUi.panelBody}>
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-neutral-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando...
            </div>
          )}

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="mb-4 rounded-lg bg-green-950/60 px-4 py-3 text-sm text-green-300">
              {success}
            </p>
          )}

          {!loading && target.type === "user" && user && (
            <div className="space-y-5">
              <div className={adminUi.panelSection}>
                <p className="font-mono text-violet-300">{user.email}</p>
                <p className="mt-1 text-neutral-500">
                  ID: <span className="font-mono">{user.id}</span>
                </p>
                <p className="mt-1 text-neutral-500">
                  Registro: {formatDateTime(user.created_at)}
                </p>
                <p className="mt-1 text-neutral-500">
                  Auth: {user.google_id ? "Google + email" : "Email/contraseña"}
                </p>
                <p className="mt-1 text-neutral-500">
                  Push subscriptions: {pushCount}
                </p>
              </div>

              <Field label="Nombre">
                <input
                  className={inputClass}
                  value={userForm.full_name}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                />
              </Field>

              <label className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={userForm.is_admin}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, is_admin: e.target.checked }))
                  }
                  className="rounded border-neutral-600"
                />
                <span className="text-sm text-neutral-200">Acceso administrador</span>
              </label>

              <Button onClick={saveUser} disabled={saving} className="w-full">
                {saving ? "Guardando..." : "Guardar usuario"}
              </Button>

              {userProfiles.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-neutral-300">
                    Perfiles ({userProfiles.length})
                  </p>
                  <ul className="space-y-2">
                    {userProfiles.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
                      >
                        <span>{p.beneficiary_name}</span>
                        <a
                          href={getPublicProfileUrl(p.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-400 hover:underline"
                        >
                          /p/{p.slug}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!loading && target.type === "profile" && profile && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <a
                  href={getPublicProfileUrl(profile.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-violet-900/50 px-3 py-1.5 text-xs text-violet-200 hover:bg-violet-900"
                >
                  <ExternalLink className="h-3 w-3" />
                  Abrir perfil público
                </a>
                <a
                  href={getSosOnlyUrl(profile.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-red-900/50 px-3 py-1.5 text-xs text-red-200 hover:bg-red-900"
                >
                  <ExternalLink className="h-3 w-3" />
                  Modo SOS
                </a>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-xs text-neutral-600">
                <p>Tutor: {profile.tutor_email}</p>
                <p className="mt-1 font-mono">ID: {profile.id}</p>
                <p className="mt-1">Slug: /p/{profile.slug}</p>
                <p className="mt-1">Escaneos: {profile.scan_count}</p>
                {profile.clinical_pdf_filename && (
                  <p className="mt-1">PDF: {profile.clinical_pdf_filename}</p>
                )}
              </div>

              <Field label="Beneficiario">
                <input
                  className={inputClass}
                  value={profileForm.beneficiary_name ?? ""}
                  onChange={(e) =>
                    setProfileForm((f) => ({
                      ...f,
                      beneficiary_name: e.target.value,
                    }))
                  }
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Contacto emergencia">
                  <input
                    className={inputClass}
                    value={profileForm.emergency_contact_name ?? ""}
                    onChange={(e) =>
                      setProfileForm((f) => ({
                        ...f,
                        emergency_contact_name: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Teléfono">
                  <input
                    className={inputClass}
                    value={profileForm.emergency_contact_phone ?? ""}
                    onChange={(e) =>
                      setProfileForm((f) => ({
                        ...f,
                        emergency_contact_phone: e.target.value,
                      }))
                    }
                  />
                </Field>
              </div>

              <Field label="Instrucciones">
                <textarea
                  className={`${inputClass} min-h-[80px] resize-y`}
                  value={profileForm.instructions ?? ""}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, instructions: e.target.value }))
                  }
                />
              </Field>

              <Field label="Notas médicas">
                <textarea
                  className={`${inputClass} min-h-[60px] resize-y`}
                  value={profileForm.medical_notes ?? ""}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, medical_notes: e.target.value }))
                  }
                />
              </Field>

              <Field label="Alergias">
                <input
                  className={inputClass}
                  value={profileForm.allergies ?? ""}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, allergies: e.target.value }))
                  }
                />
              </Field>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={saveProfile} disabled={saving} className="flex-1">
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={actionLoading === "toggle"}
                  onClick={toggleProfileActive}
                  className="border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100"
                >
                  {profile.is_active ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  disabled={actionLoading === "delete"}
                  onClick={deleteProfile}
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}

          {!loading && target.type === "scan" && scan && (
            <div className="space-y-4">
              <div
                className={`rounded-xl border px-4 py-3 text-sm font-bold uppercase ${
                  scan.alert_type === "sos"
                    ? "border-red-800 bg-red-950/60 text-red-300"
                    : "border-neutral-200 bg-neutral-50 text-neutral-700"
                }`}
              >
                {scan.alert_type === "sos" ? "🆘 Alerta SOS" : "📱 Escaneo QR"}
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-neutral-700">
                <p className="font-semibold text-neutral-900">{scan.beneficiary_name}</p>
                <p className="mt-1 text-neutral-500">Tutor: {scan.tutor_email}</p>
                <p className="mt-1 text-neutral-500">
                  {formatDateTime(scan.scanned_at)}
                </p>
                <p className="mt-1 font-mono text-xs text-neutral-600">
                  {scan.id}
                </p>
                {scan.user_agent && (
                  <p className="mt-2 break-all text-xs text-neutral-500">
                    UA: {scan.user_agent}
                  </p>
                )}
                <p className="mt-2 text-xs">
                  Push del tutor: {scan.push_subscription_count} dispositivo(s)
                </p>
                <p className="mt-1 text-xs">
                  Estado: {scan.read_at ? `Leído (${formatDateTime(scan.read_at)})` : "Sin leer"}
                </p>
              </div>

              {scan.latitude != null && scan.longitude != null && (
                <a
                  href={getGoogleMapsUrl(
                    Number(scan.latitude),
                    Number(scan.longitude),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-violet-700 shadow-sm hover:bg-violet-50"
                >
                  <MapPin className="h-4 w-4" />
                  Ver en Google Maps ({Number(scan.latitude).toFixed(5)},{" "}
                  {Number(scan.longitude).toFixed(5)})
                </a>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={actionLoading === "resend"}
                  onClick={resendAlert}
                  className="gap-1"
                >
                  {actionLoading === "resend" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  Reenviar alerta + push
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={actionLoading === "read"}
                  onClick={toggleScanRead}
                  className="border-violet-200 bg-violet-50 text-violet-900"
                >
                  {scan.read_at ? "Marcar no leído" : "Marcar leído"}
                </Button>
                <a
                  href={`/dashboard/logs/${scan.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Vista tutor
                </a>
                <button
                  type="button"
                  onClick={load}
                  className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refrescar
                </button>
              </div>

              {scan.scanner_note && (
                <div className="rounded-lg bg-white px-4 py-3 text-sm shadow-sm">
                  <p className="text-xs text-neutral-500">Nota del escaneo</p>
                  <p className="mt-1 text-neutral-200">{scan.scanner_note}</p>
                </div>
              )}

              <div>
                <p className="mb-2 text-sm font-semibold text-neutral-300">
                  Mensajes ({scan.messages.length})
                </p>
                {scan.messages.length === 0 ? (
                  <p className="text-sm text-neutral-500">Sin mensajes</p>
                ) : (
                  <ul className="max-h-48 space-y-2 overflow-y-auto">
                    {scan.messages.map((msg: ScanMessage) => (
                      <li
                        key={msg.id}
                        className={`rounded-lg px-3 py-2 text-sm ${
                          msg.sender === "tutor"
                            ? "bg-violet-950/60 text-violet-100"
                            : "bg-neutral-100 text-neutral-800"
                        }`}
                      >
                        <span className="text-[10px] uppercase text-neutral-500">
                          {msg.sender === "tutor" ? "Familia" : "Escáner"} ·{" "}
                          {formatDateTime(msg.created_at)}
                        </span>
                        {msg.media_type === "image" && msg.media_b64 && msg.media_mime ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`data:${msg.media_mime};base64,${msg.media_b64}`}
                            alt={msg.media_filename || "Foto"}
                            className="mt-1 max-h-40 w-full rounded object-contain"
                          />
                        ) : null}
                        {msg.media_type === "audio" && msg.media_b64 && msg.media_mime ? (
                          <audio
                            controls
                            preload="metadata"
                            src={`data:${msg.media_mime};base64,${msg.media_b64}`}
                            className="mt-1 max-w-full"
                          />
                        ) : null}
                        {msg.body ? (
                          <p className="mt-0.5 whitespace-pre-wrap">{msg.body}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
