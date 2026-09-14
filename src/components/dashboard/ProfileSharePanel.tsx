"use client";

import { useCallback, useEffect, useState } from "react";
import { Share2, Trash2, Users } from "lucide-react";
import type {
  ProfileSharePermissions,
  ProfileShareWithUser,
  ProfileType,
} from "@/types/database";
import { Button } from "@/components/ui/Button";
import { DEFAULT_SHARE_PERMISSIONS, MAX_PROFILE_SHARES } from "@/lib/profile-access";
import { cn } from "@/lib/utils/cn";

type ProfileSharePanelProps = {
  profileId: string;
  profileName: string;
  profileType: ProfileType;
};

const PERMISSION_LABELS: {
  key: keyof ProfileSharePermissions;
  label: string;
  description: string;
  profileTypes?: ProfileType[];
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
    profileTypes: ["pet"],
  },
  {
    key: "can_save_location",
    label: "Guardar ubicación",
    description: "Solo aplica a objetos.",
    profileTypes: ["object"],
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

function activePermissionLabels(
  share: ProfileSharePermissions,
  profileType: ProfileType,
): string[] {
  return PERMISSION_LABELS.filter(
    ({ key, profileTypes }) =>
      share[key] && (!profileTypes || profileTypes.includes(profileType)),
  ).map(({ label }) => label);
}

export function ProfileSharePanel({
  profileId,
  profileName,
  profileType,
}: ProfileSharePanelProps) {
  const [shares, setShares] = useState<ProfileShareWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [invitePermissions, setInvitePermissions] = useState<ProfileSharePermissions>({
    ...DEFAULT_SHARE_PERMISSIONS,
  });
  const [inviteExpiresAt, setInviteExpiresAt] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<ProfileSharePermissions>({
    ...DEFAULT_SHARE_PERMISSIONS,
  });
  const [editExpiresAt, setEditExpiresAt] = useState("");

  const permissionOptions = PERMISSION_LABELS.filter(
    ({ profileTypes }) => !profileTypes || profileTypes.includes(profileType),
  );

  const loadShares = useCallback(async () => {
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
  }, [profileId]);

  useEffect(() => {
    void loadShares();
  }, [loadShares]);

  function showSuccess(message: string) {
    setSuccess(message);
    window.setTimeout(() => setSuccess(null), 4000);
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
          permissions: invitePermissions,
          expiresAt: inviteExpiresAt
            ? new Date(`${inviteExpiresAt}T23:59:59`).toISOString()
            : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo compartir");
        return;
      }
      setShares(data.shares ?? []);
      setEmail("");
      setInvitePermissions({ ...DEFAULT_SHARE_PERMISSIONS });
      setInviteExpiresAt("");
      showSuccess("Perfil compartido. La persona recibirá un email con los permisos.");
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
          permissions: editPermissions,
          expiresAt: editExpiresAt
            ? new Date(`${editExpiresAt}T23:59:59`).toISOString()
            : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo actualizar");
        return;
      }
      setShares(data.shares ?? []);
      setEditingId(null);
      showSuccess("Permisos actualizados.");
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
      showSuccess("Acceso revocado.");
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(share: ProfileShareWithUser) {
    setEditingId(share.id);
    setEditPermissions({
      can_receive_alerts: share.can_receive_alerts,
      can_view_profile: share.can_view_profile,
      can_edit_profile: share.can_edit_profile,
      can_view_health_book: share.can_view_health_book,
      can_save_location: share.can_save_location,
    });
    setEditExpiresAt(toDateInputValue(share.expires_at));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </p>
      )}

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-black text-neutral-900">
              Personas con acceso
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              {shares.length} de {MAX_PROFILE_SHARES} cuentas compartidas con{" "}
              <strong>{profileName}</strong>.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-neutral-500">Cargando...</p>
        ) : shares.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-600">
            Todavía no compartiste este perfil con nadie. Invitá a alguien con el
            formulario de abajo.
          </p>
        ) : (
          <ul className="space-y-4">
            {shares.map((share) => {
              const isEditing = editingId === share.id;
              const badges = activePermissionLabels(share, profileType);

              return (
                <li
                  key={share.id}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900">
                        {formatShareName(share)}
                      </p>
                      <p className="text-sm text-neutral-500">{share.shared_with_email}</p>
                      <p className="mt-2 text-sm text-neutral-600">
                        {share.expires_at
                          ? `Vence el ${new Date(share.expires_at).toLocaleDateString("es-AR")}`
                          : "Acceso permanente"}
                      </p>
                      {!isEditing && badges.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {badges.map((label) => (
                            <span
                              key={label}
                              className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-800"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex shrink-0 gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => startEdit(share)}
                        >
                          Editar permisos
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
                    )}
                  </div>

                  {isEditing && (
                    <div className="mt-5 space-y-4 border-t border-neutral-200 pt-5">
                      <PermissionPicker
                        permissions={editPermissions}
                        options={permissionOptions}
                        onToggle={(key) =>
                          setEditPermissions((current) => ({
                            ...current,
                            [key]: !current[key],
                          }))
                        }
                      />
                      <label className="block text-sm font-semibold text-neutral-800">
                        Vencimiento
                        <input
                          type="date"
                          value={editExpiresAt}
                          onChange={(e) => setEditExpiresAt(e.target.value)}
                          className="mt-2 w-full max-w-xs rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base"
                        />
                        <span className="mt-1 block text-xs font-normal text-neutral-500">
                          Dejalo vacío para acceso permanente.
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={saving}
                          onClick={() => void handleUpdateShare(share.id)}
                        >
                          {saving ? "Guardando..." : "Guardar cambios"}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={saving}
                          onClick={cancelEdit}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-violet-100 bg-violet-50/40 p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Share2 className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-black text-neutral-900">Invitar co-tutor</h2>
            <p className="mt-1 text-sm text-neutral-600">
              La persona tiene que tener cuenta SOSme. Por defecto solo recibe alertas.
            </p>
          </div>
        </div>

        <form onSubmit={handleInvite} className="space-y-4">
          <label className="block text-sm font-semibold text-neutral-800">
            Email de la otra cuenta
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alan@email.com"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base"
            />
          </label>

          <PermissionPicker
            permissions={invitePermissions}
            options={permissionOptions}
            onToggle={(key) =>
              setInvitePermissions((current) => ({
                ...current,
                [key]: !current[key],
              }))
            }
          />

          <label className="block text-sm font-semibold text-neutral-800">
            Vencimiento (opcional)
            <input
              type="date"
              value={inviteExpiresAt}
              onChange={(e) => setInviteExpiresAt(e.target.value)}
              className="mt-2 w-full max-w-xs rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base"
            />
            <span className="mt-1 block text-xs font-normal text-neutral-500">
              Dejalo vacío para acceso permanente (ideal para co-tutores fijos).
            </span>
          </label>

          <Button
            type="submit"
            disabled={saving || shares.length >= MAX_PROFILE_SHARES}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            {saving ? "Guardando..." : "Compartir perfil"}
          </Button>
          {shares.length >= MAX_PROFILE_SHARES && (
            <p className="text-sm text-amber-800">
              Llegaste al máximo de {MAX_PROFILE_SHARES} cuentas. Editá o revocá un
              acceso existente para invitar a alguien nuevo.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}

function PermissionPicker({
  permissions,
  options,
  onToggle,
}: {
  permissions: ProfileSharePermissions;
  options: typeof PERMISSION_LABELS;
  onToggle: (key: keyof ProfileSharePermissions) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-neutral-800">Permisos</legend>
      {options.map(({ key, label, description }) => (
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
