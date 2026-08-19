"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicEmergencyProfile } from "@/types/database";
import type { PublicContactLinksResponse } from "@/types/public-contact";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ContactActionsProps = {
  profile: PublicEmergencyProfile;
  alertType?: "scan" | "sos" | "general";
  latitude?: number | null;
  longitude?: number | null;
  scannerNote?: string | null;
  scanLogId?: string | null;
  compact?: boolean;
  variant?: "default" | "emergency";
  isLight?: boolean;
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

type ContactRowProps = {
  contact: PublicContactLinksResponse["primary"];
  label?: string;
  compact?: boolean;
  emergency?: boolean;
  isLight?: boolean;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
};

function ContactRow({
  contact,
  label,
  compact,
  emergency,
  isLight = false,
  loading = false,
  error = false,
  onRetry,
}: ContactRowProps) {
  const disabled = loading || error;

  if (emergency) {
    return (
      <div
        className={cn(
          "rounded-2xl border p-4",
          isLight
            ? "border-neutral-200 bg-neutral-50 shadow-sm"
            : "border-neutral-700/80 bg-neutral-950/60",
        )}
      >
        {label && (
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {label}
          </p>
        )}
        <p
          className={cn(
            "mt-1 text-lg font-bold",
            isLight ? "text-neutral-900" : "text-white",
          )}
        >
          {contact.name}
        </p>
        {error ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 text-sm text-amber-500 underline"
          >
            No se pudieron cargar los contactos. Reintentar
          </button>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <a
              href={disabled ? undefined : contact.telUrl}
              aria-disabled={disabled}
              className={cn(
                "flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/30 transition-transform",
                disabled
                  ? "pointer-events-none opacity-50"
                  : "active:scale-[0.98]",
              )}
            >
              <Phone className="h-5 w-5 shrink-0" aria-hidden />
              {loading ? "Cargando…" : "Llamar"}
            </a>
            <a
              href={disabled ? undefined : contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={disabled}
              className={cn(
                "flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/20 transition-transform",
                disabled
                  ? "pointer-events-none opacity-50"
                  : "active:scale-[0.98]",
              )}
            >
              <WhatsAppIcon className="h-5 w-5 shrink-0" />
              {loading ? "Cargando…" : "WhatsApp"}
            </a>
          </div>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            {label}
          </p>
        )}
        <p className="text-base font-bold text-white">{contact.name}</p>
        {error ? (
          <button
            type="button"
            onClick={onRetry}
            className="text-sm text-amber-400 underline"
          >
            Reintentar carga de contacto
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <a
              href={disabled ? undefined : contact.telUrl}
              aria-disabled={disabled}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-4 text-sm font-bold text-white",
                disabled && "pointer-events-none opacity-50",
              )}
            >
              <Phone className="h-5 w-5" aria-hidden />
              {loading ? "…" : "Llamar"}
            </a>
            <a
              href={disabled ? undefined : contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={disabled}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-4 text-sm font-bold text-white",
                disabled && "pointer-events-none opacity-50",
              )}
            >
              <WhatsAppIcon className="h-5 w-5" />
              {loading ? "…" : "WhatsApp"}
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {label}
        </p>
      )}
      <p className="text-sm font-medium text-neutral-300">{contact.name}</p>
      {error ? (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm text-amber-400 underline"
        >
          Reintentar carga de contacto
        </button>
      ) : (
        <>
          <a
            href={disabled ? undefined : contact.telUrl}
            aria-disabled={disabled}
            className={cn(
              "flex min-h-[64px] items-center justify-center gap-3 rounded-2xl bg-green-600 px-6 py-4 text-lg font-black text-white shadow-lg",
              disabled
                ? "pointer-events-none opacity-50"
                : "active:scale-[0.98]",
            )}
          >
            <Phone className="h-7 w-7 shrink-0" aria-hidden />
            {loading ? "Cargando contacto…" : `Llamar a ${contact.name}`}
          </a>
          <a
            href={disabled ? undefined : contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={disabled}
            className={cn(
              "flex min-h-[56px] items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 text-lg font-bold text-white shadow-lg",
              disabled
                ? "pointer-events-none opacity-50"
                : "active:scale-[0.98]",
            )}
          >
            <WhatsAppIcon className="h-7 w-7 shrink-0" />
            {loading ? "Cargando…" : `WhatsApp a ${contact.name}`}
          </a>
        </>
      )}
    </div>
  );
}

export function ContactActions({
  profile,
  alertType = "general",
  latitude,
  longitude,
  scannerNote,
  scanLogId,
  compact = false,
  variant = "default",
  isLight = false,
}: ContactActionsProps) {
  const [links, setLinks] = useState<PublicContactLinksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: profile.slug,
          alertType,
          latitude,
          longitude,
          scannerNote,
          scanLogId,
        }),
      });
      if (!res.ok) {
        setError(true);
        setLinks(null);
        return;
      }
      const data = (await res.json()) as PublicContactLinksResponse;
      setLinks(data);
    } catch {
      setError(true);
      setLinks(null);
    } finally {
      setLoading(false);
    }
  }, [
    profile.slug,
    alertType,
    latitude,
    longitude,
    scannerNote,
    scanLogId,
  ]);

  useEffect(() => {
    void fetchLinks();
  }, [fetchLinks]);

  const isEmergency = variant === "emergency";

  const primaryPlaceholder: PublicContactLinksResponse["primary"] = {
    name: profile.emergency_contact_name,
    telUrl: "",
    whatsappUrl: "",
  };

  const secondaryPlaceholder: PublicContactLinksResponse["secondary"] =
    profile.secondary_contact_name?.trim()
      ? {
          name: profile.secondary_contact_name.trim(),
          telUrl: "",
          whatsappUrl: "",
        }
      : null;

  return (
    <div className={`flex flex-col ${isEmergency ? "gap-3" : "gap-6"}`}>
      <ContactRow
        contact={links?.primary ?? primaryPlaceholder}
        label="Contacto principal"
        compact={compact && !isEmergency}
        emergency={isEmergency}
        isLight={isLight}
        loading={loading}
        error={error}
        onRetry={() => void fetchLinks()}
      />
      {(links?.secondary ?? secondaryPlaceholder) && (
        <ContactRow
          contact={links?.secondary ?? secondaryPlaceholder!}
          label="Contacto secundario"
          compact={compact && !isEmergency}
          emergency={isEmergency}
          isLight={isLight}
          loading={loading}
          error={error}
          onRetry={() => void fetchLinks()}
        />
      )}
    </div>
  );
}
