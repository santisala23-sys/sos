"use client";

import { useEffect, useState } from "react";
import { Share2, Trash2, X } from "lucide-react";
import type { ProfileSharePermissions, ProfileShareWithUser } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { DEFAULT_SHARE_PERMISSIONS, MAX_PROFILE_SHARES } from "@/lib/profile-access";
import { cn } from "@/lib/utils/cn";

type ProfileShareManagerProps = {
  profileId: string;
  profileName: string;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

const PERMISSION_LABELS: {
  key: keyof ProfileSharePermissions;
  label: string;
  description: string;
}[] = [
  {
    key: "can_receive_alerts",
    label: "Recibir alertas",
    description: "Push cuando escanean el QR o hay actividad.",
  },
  {
    key: "can_view_profile",
    label: "Ver perfil",
    description: "Acceder al detalle y actividad del perfil.",
  },
  {
    key: "can_edit_profile",
    label: "Editar perfil",
    description: "Modificar contactos e instrucciones.",
  },
  {
    key: "can_view_health_book",
    label: "Ver libreta sanitaria",
    description: "Solo aplica a mascotas.",
  },
  {
    key: "can_save_location",
    label: "Guardar ubicación",
    description: "Solo aplica a objetos.",
  },
];

function formatShareName(share: ProfileShareWithUser): string {
  return share.shared_with_name?.trim() || share.shared_with_email;
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function ProfileShareManager({
  profileId,
  profileName,
  open,
  onClose,
  onUpdated,
}: ProfileShareManagerProps) {
  const [shares, setShares] = useState<ProfileShareWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<ProfileSharePermissions>({
    ...DEFAULT_SHARE_PERMISSIONS,
  });
  const [expiresAt, setExpiresAt] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setEditingId(null);
    setEmail("");
    setPermissions({ ...DEFAULT_SHARE_PERMISSIONS });
    setExpiresAt("");
    void loadShares();
  }, [open, profileId]);

  async function loadShares() {
    setLoading(true);
    try {
      const res = await fetch(`/api/qr-profiles/${profileId}/shares`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudieron cargar los compartidos");
        return;
      }
      setShares(data.shares ?? []);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  function togglePermission(key: keyof ProfileSharePermissions) {
    setPermissions((current) => ({ ...current, [key]: !current[key] }));
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/qr-profiles/${profileId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          permissions,
          expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo compartir");
        return;
      }
      setShares(data.shares ?? []);
      setEmail("");
      setPermissions({ ...DEFAULT_SHARE_PERMISSIONS });
      setExpiresAt("");
      onUpdated();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateShare(shareId: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/qr-profiles/${profileId}/shares/${shareId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissions,
          expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo actualizar");
        return;
      }
      setShares(data.shares ?? []);
      setEditingId(null);
      onUpdated();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleRevoke(shareId: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/qr-profiles/${profileId}/shares/${shareId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo quitar el acceso");
        return;
      }
      setShares(data.shares ?? []);
      if (editingId === shareId) setEditingId(null);
      onUpdated();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(share: ProfileShareWithUser) {
    setEditingId(share.id);
    setPermissions({
      can_receive_alerts: share.can_receive_alerts,
      can_view_profile: share.can_view_profile,
      can_edit_profile: share.can_edit_profile,
      can_view_health_book: share.can_view_health_book,
      can_save_location: share.can_save_location,
    });
    setExpiresAt(toDateInputValue(share.expires_at));
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Compartir perfil"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.35rem] border border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
              Co-tutoría
            </p>
            <h3 className="mt-1 text-lg font-black text-neutral-900">
              Compartir {profileName}
            </h3>
            <p className="mt-1 text-sm text-neutral-600">
              Hasta {MAX_PROFILE_SHARES} cuentas. Por defecto solo reciben alertas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <form onSubmit={handleInvite} className="space-y-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
            <label className="block text-sm font-semibold text-neutral-800">
              Email de la otra cuenta SOSme
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alan@email.com"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base"
              />
            </label>

            <PermissionPicker permissions={permissions} onToggle={togglePermission} />

            <label className="block text-sm font-semibold text-neutral-800">
              Vencimiento (opcional)
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base"
              />
              <span className="mt-1 block text-xs font-normal text-neutral-500">
                Dejalo vacío para acceso permanente.
              </span>
            </label>

            <Button type="submit" disabled={saving || shares.length >= MAX_PROFILE_SHARES} className="w-full gap-2">
              <Share2 className="h-4 w-4" />
              {saving ? "Guardando..." : "Compartir perfil"}
            </Button>
          </form>

          <div>
            <h4 className="text-sm font-bold text-neutral-900">Compartido con</h4>
            {loading ? (
              <p className="mt-3 text-sm text-neutral-500">Cargando...</p>
            ) : shares.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-600">
                Todavía no compartiste este perfil con nadie.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {shares.map((share) => (
                  <li
                    key={share.id}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-neutral-900">{formatShareName(share)}</p>
                        <p className="text-xs text-neutral-500">{share.shared_with_email}</p>
                        <p className="mt-2 text-xs text-neutral-600">
                          {share.expires_at
                            ? `Vence el ${new Date(share.expires_at).toLocaleDateString("es-AR")}`
                            : "Acceso permanente"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => startEdit(share)}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-700 hover:bg-red-50"
                          disabled={saving}
                          onClick={() => void handleRevoke(share.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {editingId === share.id && (
                      <div className="mt-4 space-y-3 border-t border-neutral-200 pt-4">
                        <PermissionPicker permissions={permissions} onToggle={togglePermission} />
                        <label className="block text-sm font-semibold text-neutral-800">
                          Vencimiento
                          <input
                            type="date"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base"
                          />
                        </label>
                        <Button
                          type="button"
                          size="sm"
                          disabled={saving}
                          onClick={() => void handleUpdateShare(share.id)}
                        >
                          Guardar cambios
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PermissionPicker({
  permissions,
  onToggle,
}: {
  permissions: ProfileSharePermissions;
  onToggle: (key: keyof ProfileSharePermissions) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-neutral-800">Permisos</legend>
      {PERMISSION_LABELS.map(({ key, label, description }) => (
        <label
          key={key}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition",
            permissions[key]
              ? "border-violet-200 bg-white"
              : "border-neutral-200 bg-white/70",
          )}
        >
          <input
            type="checkbox"
            checked={permissions[key]}
            onChange={() => onToggle(key)}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-semibold text-neutral-900">{label}</span>
            <span className="block text-xs text-neutral-500">{description}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
