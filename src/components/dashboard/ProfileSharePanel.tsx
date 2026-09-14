"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, MessageCircle, Share2, Trash2, Users } from "lucide-react";
import type {
  ProfileSharePermissions,
  ProfileShareWithUser,
  ProfileType,
} from "@/types/database";
import { Button } from "@/components/ui/Button";
import {
  ShareExpiryField,
  expiryFromMode,
  modeFromExpiry,
  type ShareExpiryMode,
} from "@/components/dashboard/ShareExpiryField";
import {
  DEFAULT_SHARE_PERMISSIONS,
  MAX_PROFILE_SHARES,
  PROFILE_SHARE_INVITE_TTL_MS,
} from "@/lib/profile-access";
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

function validateExpiry(mode: ShareExpiryMode, dateValue: string): string | null {
  if (mode === "permanent") return null;
  if (!dateValue) {
    return "Elegí la fecha hasta la cual tendrá acceso, o marcá Acceso permanente.";
  }
  return null;
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
  const [inviteExpiryMode, setInviteExpiryMode] = useState<ShareExpiryMode>("permanent");
  const [inviteExpiresAt, setInviteExpiresAt] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<ProfileSharePermissions>({
    ...DEFAULT_SHARE_PERMISSIONS,
  });
  const [editExpiryMode, setEditExpiryMode] = useState<ShareExpiryMode>("permanent");
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [inviteLinkUrl, setInviteLinkUrl] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteLinkTtlDays = Math.round(PROFILE_SHARE_INVITE_TTL_MS / (24 * 60 * 60 * 1000));

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

  async function handleGenerateInviteLink() {
    const expiryError = validateExpiry(inviteExpiryMode, inviteExpiresAt);
    if (expiryError) {
      setError(expiryError);
      return;
    }

    setGeneratingLink(true);
    setError(null);
    setCopiedLink(false);
    try {
      const res = await fetch(`/api/qr-profiles/${profileId}/shares/invite-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissions: invitePermissions,
          expiresAt: expiryFromMode(inviteExpiryMode, inviteExpiresAt),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear el link");
        return;
      }
      setInviteLinkUrl(data.inviteUrl ?? null);
      setWhatsappUrl(data.whatsappUrl ?? null);
      showSuccess("Link listo. Mandalo por WhatsApp o copialo.");
    } catch {
      setError("Error de conexión");
    } finally {
      setGeneratingLink(false);
    }
  }

  async function handleCopyInviteLink() {
    if (!inviteLinkUrl) return;
    try {
      await navigator.clipboard.writeText(inviteLinkUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setError("No se pudo copiar el link");
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const expiryError = validateExpiry(inviteExpiryMode, inviteExpiresAt);
    if (expiryError) {
      setError(expiryError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/qr-profiles/${profileId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          permissions: invitePermissions,
          expiresAt: expiryFromMode(inviteExpiryMode, inviteExpiresAt),
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
      setInviteExpiryMode("permanent");
      setInviteExpiresAt("");
      showSuccess("Perfil compartido. La persona recibirá un email con los permisos.");
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateShare(shareId: string) {
    const expiryError = validateExpiry(editExpiryMode, editExpiresAt);
    if (expiryError) {
      setError(expiryError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/qr-profiles/${profileId}/shares/${shareId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissions: editPermissions,
          expiresAt: expiryFromMode(editExpiryMode, editExpiresAt),
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
    setEditExpiryMode(modeFromExpiry(share.expires_at));
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

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <section className="min-w-0 flex-1 rounded-2xl border border-violet-100 bg-violet-50/40 p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Share2 className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-lg font-black text-neutral-900">Invitar co-tutor</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Elegí permisos y compartí por email o mandá un link por WhatsApp. La
              persona necesita cuenta SOSme (gratis) para aceptar.
            </p>
          </div>
        </div>

        <div className="space-y-5">
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

          <ShareExpiryField
            idPrefix="invite"
            mode={inviteExpiryMode}
            dateValue={inviteExpiresAt}
            onModeChange={setInviteExpiryMode}
            onDateChange={setInviteExpiresAt}
          />

          {shares.length >= MAX_PROFILE_SHARES && (
            <p className="text-sm text-amber-800">
              Llegaste al máximo de {MAX_PROFILE_SHARES} cuentas. Editá o revocá un
              acceso existente para invitar a alguien nuevo.
            </p>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <form
              onSubmit={handleInvite}
              className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Por email</h3>
                <p className="mt-1 text-xs text-neutral-500">
                  Si ya tiene cuenta SOSme con ese correo.
                </p>
              </div>
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
              <Button
                type="submit"
                disabled={saving || shares.length >= MAX_PROFILE_SHARES}
                className="w-full gap-2"
                variant="secondary"
              >
                <Share2 className="h-4 w-4" />
                {saving ? "Enviando..." : "Invitar por email"}
              </Button>
            </form>

            <div className="space-y-4 rounded-2xl border border-green-200 bg-green-50/50 p-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Por WhatsApp</h3>
                <p className="mt-1 text-xs text-neutral-600">
                  Ideal para familiares. Generás un link, se lo mandás por WhatsApp y
                  cuando lo abren crean cuenta o inician sesión.
                </p>
              </div>
              <Button
                type="button"
                disabled={generatingLink || shares.length >= MAX_PROFILE_SHARES}
                onClick={() => void handleGenerateInviteLink()}
                className="w-full gap-2 bg-[#25D366] hover:bg-[#1ebe57] focus-visible:ring-[#25D366]"
              >
                <MessageCircle className="h-4 w-4" />
                {generatingLink ? "Generando link..." : "Generar link para WhatsApp"}
              </Button>
              <p className="text-xs text-neutral-500">
                El link de invitación vence en {inviteLinkTtlDays} días si no lo usan.
              </p>

              {inviteLinkUrl && (
                <div className="space-y-3 rounded-xl border border-green-200 bg-white p-3">
                  <p className="text-xs font-semibold text-neutral-700">Link de invitación</p>
                  <p className="break-all rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-800">
                    {inviteLinkUrl}
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="gap-2"
                      onClick={() => void handleCopyInviteLink()}
                    >
                      <Copy className="h-4 w-4" />
                      {copiedLink ? "Copiado" : "Copiar link"}
                    </Button>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1ebe57]"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Abrir WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </section>

        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-80 xl:w-[22rem]">
          <section className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Users className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-black text-neutral-900">
                  Personas con acceso
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">
                  {shares.length} de {MAX_PROFILE_SHARES} cuentas compartidas con{" "}
                  <strong className="font-semibold text-neutral-800">{profileName}</strong>.
                </p>
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-neutral-500">Cargando...</p>
            ) : shares.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-6 text-center text-xs text-neutral-600">
                Todavía no compartiste este perfil con nadie.
              </p>
            ) : (
              <ul className="space-y-3">
                {shares.map((share) => {
                  const isEditing = editingId === share.id;
                  const badges = activePermissionLabels(share, profileType);

                  return (
                    <li
                      key={share.id}
                      className="rounded-xl border border-neutral-200 bg-white p-3.5"
                    >
                      <div className="space-y-2">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-sm text-neutral-900">
                            {formatShareName(share)}
                          </p>
                          <p className="truncate text-xs text-neutral-500">
                            {share.shared_with_email}
                          </p>
                          <p className="mt-1.5 text-xs text-neutral-600">
                            {share.expires_at
                              ? `Vence el ${new Date(share.expires_at).toLocaleDateString("es-AR")}`
                              : "Acceso permanente"}
                          </p>
                        </div>

                        {!isEditing && badges.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {badges.map((label) => (
                              <span
                                key={label}
                                className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}

                        {!isEditing && (
                          <div className="flex gap-1.5 pt-0.5">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-8 flex-1 px-2 text-xs"
                              onClick={() => startEdit(share)}
                            >
                              Editar permisos
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 shrink-0 px-0 text-red-700 hover:bg-red-50"
                              disabled={saving}
                              onClick={() => void handleRevoke(share.id)}
                              aria-label="Quitar acceso"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {isEditing && (
                        <div className="mt-3 space-y-3 border-t border-neutral-200 pt-3">
                          <PermissionPicker
                            compact
                            permissions={editPermissions}
                            options={permissionOptions}
                            onToggle={(key) =>
                              setEditPermissions((current) => ({
                                ...current,
                                [key]: !current[key],
                              }))
                            }
                          />
                          <ShareExpiryField
                            idPrefix={`edit-${share.id}`}
                            mode={editExpiryMode}
                            dateValue={editExpiresAt}
                            onModeChange={setEditExpiryMode}
                            onDateChange={setEditExpiresAt}
                          />
                          <div className="flex flex-col gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              className="w-full"
                              disabled={saving}
                              onClick={() => void handleUpdateShare(share.id)}
                            >
                              {saving ? "Guardando..." : "Guardar cambios"}
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="w-full"
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
        </aside>
      </div>
    </div>
  );
}

function PermissionPicker({
  permissions,
  options,
  onToggle,
  compact = false,
}: {
  permissions: ProfileSharePermissions;
  options: typeof PERMISSION_LABELS;
  onToggle: (key: keyof ProfileSharePermissions) => void;
  compact?: boolean;
}) {
  return (
    <fieldset className="space-y-2">
      <legend
        className={cn(
          "font-semibold text-neutral-800",
          compact ? "text-xs" : "text-sm",
        )}
      >
        Permisos
      </legend>
      {options.map(({ key, label, description }) => (
        <label
          key={key}
          className={cn(
            "flex cursor-pointer items-start gap-2.5 rounded-xl border transition",
            compact ? "px-2.5 py-2" : "gap-3 px-3 py-2.5",
            permissions[key]
              ? "border-violet-200 bg-white"
              : "border-neutral-200 bg-white/70",
          )}
        >
          <input
            type="checkbox"
            checked={permissions[key]}
            onChange={() => onToggle(key)}
            className="mt-0.5"
          />
          <span>
            <span
              className={cn(
                "block font-semibold text-neutral-900",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {label}
            </span>
            {!compact && (
              <span className="block text-xs text-neutral-500">{description}</span>
            )}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
