"use client";

import { useState } from "react";
import {
  ClipboardList,
  ExternalLink,
  Eye,
  MapPin,
  Pencil,
  QrCode,
  Trash2,
  X,
} from "lucide-react";
import type { QrProfile } from "@/types/database";
import { CardActionPill, CardScanAddButton } from "@/components/dashboard/ProfileCardActions";
import { QrCodeDisplay } from "@/components/dashboard/QrCodeDisplay";
import { Button } from "@/components/ui/Button";
import { getProfileCardTheme } from "@/lib/dashboard/profile-card-theme";
import { getTutorPublicPreviewUrl } from "@/lib/utils/slug";
import {
  geolocationErrorMessage,
  requestGeolocation,
} from "@/lib/utils/geolocation";
import { describePetAge } from "@/lib/utils/pet-age";
import { cn } from "@/lib/utils/cn";

type ProfileCardProps = {
  profile: QrProfile;
  onRefresh: () => void;
  defaultShowQr?: boolean;
  onScanNew?: () => void;
};

type SaveLocationPhase = "idle" | "loading" | "success" | "error";

export function ProfileCard({
  profile,
  onRefresh,
  defaultShowQr = false,
  onScanNew,
}: ProfileCardProps) {
  const [showQr, setShowQr] = useState(defaultShowQr);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savePhase, setSavePhase] = useState<SaveLocationPhase>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const theme = getProfileCardTheme(profile.profile_type);
  const TypeIcon = theme.icon;
  const previewUrl = getTutorPublicPreviewUrl(profile.id);
  const isPet = profile.profile_type === "pet";
  const isObject = profile.profile_type === "object";
  const editHref = `/dashboard/perfiles/${profile.id}/editar?from=${encodeURIComponent("/dashboard")}`;

  const petMeta = [
    profile.pet_breed?.trim(),
    profile.pet_birth_date ? describePetAge(profile.pet_birth_date) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/qr-profiles/${profile.id}`, { method: "DELETE" });
    setDeleting(false);
    setConfirmDelete(false);
    onRefresh();
  }

  async function handleSaveLocation() {
    if (!isObject || savePhase === "loading") return;

    setSavePhase("loading");
    setSaveError(null);

    const result = await requestGeolocation();
    if (!result.ok) {
      setSaveError(geolocationErrorMessage(result.reason));
      setSavePhase("error");
      return;
    }

    try {
      const res = await fetch(`/api/qr-profiles/${profile.id}/saved-locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: result.latitude,
          longitude: result.longitude,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setSaveError(
          data.error ??
            "No pudimos guardar la ubicación. Intentá de nuevo en unos segundos.",
        );
        setSavePhase("error");
        return;
      }

      setSavePhase("success");
      onRefresh();
      window.setTimeout(() => {
        setSavePhase("idle");
        setSaveError(null);
      }, 3500);
    } catch {
      setSaveError(
        "No pudimos guardar la ubicación. Intentá de nuevo en unos segundos.",
      );
      setSavePhase("error");
    }
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[1.35rem] border bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        theme.card,
      )}
    >
      <div className={cn("h-1.5", theme.topBar)} />

      <div
        className={cn(
          "relative border-b bg-gradient-to-br px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6",
          theme.headerGlow,
        )}
      >
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label={isPet ? "Eliminar mascota" : "Eliminar perfil"}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-red-200/80 bg-white/90 text-red-600 shadow-sm backdrop-blur-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={cn("inline-flex items-center gap-2 rounded-full py-1 pl-1.5 pr-3.5 text-xs font-bold uppercase tracking-wide", theme.badge)}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <TypeIcon className="h-3.5 w-3.5" aria-hidden />
            </span>
            {theme.label}
          </span>
          {!profile.is_active && (
            <span className="rounded-full bg-neutral-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-600">
              Inactivo
            </span>
          )}
        </div>

        <div className="flex items-start gap-4 pr-8">
          {profile.avatar_b64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:${profile.avatar_mime ?? "image/jpeg"};base64,${profile.avatar_b64}`}
              alt={profile.beneficiary_name}
              className={cn(
                "h-16 w-16 shrink-0 object-cover shadow-md ring-4",
                isPet ? "rounded-2xl" : isObject ? "rounded-xl" : "rounded-full",
                theme.avatarRing,
              )}
            />
          ) : (
            <div
              className={cn(
                "flex h-16 w-16 shrink-0 items-center justify-center shadow-inner",
                isPet ? "rounded-2xl" : isObject ? "rounded-xl" : "rounded-full",
                theme.avatarFallback,
              )}
            >
              <TypeIcon className="h-8 w-8" aria-hidden />
            </div>
          )}

          <div className="min-w-0 flex-1 pt-0.5">
            <p className={cn("text-[11px] font-bold uppercase tracking-[0.14em]", theme.contactLabel)}>
              {theme.shortLabel}
            </p>
            <h3 className="mt-1 truncate text-xl font-black tracking-tight text-neutral-900 sm:text-2xl">
              {profile.beneficiary_name}
            </h3>
            {isPet && petMeta && (
              <p className="mt-1 text-sm font-semibold text-teal-800">{petMeta}</p>
            )}
            {isPet && (
              <p className="mt-2 text-sm leading-snug text-neutral-500">
                Vacunas, visitas veterinarias y QR de emergencia.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <dl
          className={cn(
            "rounded-2xl border px-4 py-3.5 text-sm text-neutral-600",
            theme.contactBox,
          )}
        >
          <div>
            <dt className={cn("text-[11px] font-bold uppercase tracking-wide", theme.contactLabel)}>
              Contacto de emergencia
            </dt>
            <dd className="mt-1 font-semibold text-neutral-900">
              {profile.emergency_contact_name}
            </dd>
            <dd className="mt-0.5 text-neutral-700">{profile.emergency_contact_phone}</dd>
          </div>
          {profile.secondary_contact_name && profile.secondary_contact_phone && (
            <div className="mt-3 border-t border-current/10 pt-3">
              <dt className="text-[11px] font-bold uppercase tracking-wide text-neutral-400">
                Contacto secundario
              </dt>
              <dd className="mt-1 text-neutral-800">
                {profile.secondary_contact_name} · {profile.secondary_contact_phone}
              </dd>
            </div>
          )}
        </dl>

        <div
          className={cn(
            "mt-5 rounded-2xl border p-3.5 sm:p-4",
            theme.actionsPanel,
          )}
        >
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">
            Acciones
          </p>
          <div className="flex items-start gap-2.5">
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">
              {isPet && (
                <CardActionPill
                  href={`/dashboard/perfiles/${profile.id}/libreta`}
                  icon={ClipboardList}
                  label="Libreta sanitaria"
                  className={theme.pillPrimary}
                  iconWrapClassName={theme.pillPrimaryIcon}
                />
              )}

              {!isPet && (
                <CardActionPill
                  href={`/dashboard/perfiles/${profile.id}`}
                  icon={Eye}
                  label="Ver perfil"
                  className={theme.pillPrimary}
                  iconWrapClassName={theme.pillPrimaryIcon}
                />
              )}

              <CardActionPill
                href={editHref}
                icon={Pencil}
                label="Editar perfil"
                className={theme.pillSecondary}
                iconWrapClassName={theme.pillSecondaryIcon}
              />

              <CardActionPill
                href={previewUrl}
                icon={ExternalLink}
                label="Ver perfil público"
                className={theme.pillSecondary}
                iconWrapClassName={theme.pillSecondaryIcon}
                external
              />

              {isObject && (
                <CardActionPill
                  onClick={handleSaveLocation}
                  icon={MapPin}
                  label={
                    savePhase === "loading"
                      ? "Guardando..."
                      : savePhase === "success"
                        ? "Ubicación guardada"
                        : "Guardar ubicación"
                  }
                  disabled={savePhase === "loading"}
                  className={cn(
                    theme.pillOutline,
                    savePhase === "success" &&
                      "border-emerald-300 bg-emerald-50 text-emerald-900",
                  )}
                  iconWrapClassName={
                    savePhase === "success"
                      ? "bg-emerald-100 text-emerald-700"
                      : theme.pillOutlineIcon
                  }
                />
              )}

              <CardActionPill
                onClick={() => setShowQr((value) => !value)}
                icon={QrCode}
                label={showQr ? "Ocultar QR" : "Ver QR"}
                active={showQr}
                className={showQr ? theme.activeOutlineBtn : theme.pillOutline}
                iconWrapClassName={theme.pillOutlineIcon}
              />
            </div>

            {onScanNew && (
              <CardScanAddButton onClick={onScanNew} />
            )}
          </div>

          {saveError && (
            <p className="mt-2 text-xs text-red-600" role="alert">
              {saveError}
            </p>
          )}
        </div>
      </div>

      {showQr && (
        <div className={cn("border-t px-5 py-5 sm:px-6", theme.qrPanel)}>
          <QrCodeDisplay slug={profile.slug} beneficiaryName={profile.beneficiary_name} />
        </div>
      )}

      {confirmDelete && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar eliminación"
        >
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" aria-hidden />
              </div>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                aria-label="Cancelar"
                className="text-neutral-400 transition-colors hover:text-neutral-700"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <h4 className="mt-3 text-lg font-black text-neutral-900">
              {isPet
                ? "¿Estás seguro que querés eliminar esta mascota?"
                : "¿Estás seguro que querés eliminar este perfil?"}
            </h4>
            <p className="mt-1 text-sm text-neutral-600">
              Se eliminará <strong>{profile.beneficiary_name}</strong>
              {isPet ? ", su QR y la libreta sanitaria" : " y su QR dejará de funcionar"}.
              Esta acción no se puede deshacer.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                {deleting ? "Eliminando..." : isPet ? "Eliminar mascota" : "Eliminar perfil"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
