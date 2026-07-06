"use client";

import type { PublicQrProfile } from "@/types/database";
import {
  buildWhatsAppEmergencyMessage,
  buildWhatsAppUrl,
} from "@/lib/utils/whatsapp";
import { Phone } from "lucide-react";

type ContactActionsProps = {
  profile: PublicQrProfile;
  alertType?: "scan" | "sos" | "general";
  latitude?: number | null;
  longitude?: number | null;
  scannerNote?: string | null;
  scanLogId?: string | null;
  compact?: boolean;
  variant?: "default" | "emergency";
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
  name: string;
  phone: string;
  whatsAppMessage: string;
  label?: string;
  compact?: boolean;
  emergency?: boolean;
};

function ContactRow({
  name,
  phone,
  whatsAppMessage,
  label,
  compact,
  emergency,
}: ContactRowProps) {
  const telHref = `tel:${phone.replace(/\s/g, "")}`;
  const waHref = buildWhatsAppUrl(phone, whatsAppMessage);

  if (emergency) {
    return (
      <div className="rounded-2xl border border-neutral-700/80 bg-neutral-950/60 p-4">
        {label && (
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {label}
          </p>
        )}
        <p className="mt-1 text-lg font-bold text-white">{name}</p>
        <p className="mt-0.5 font-mono text-sm text-neutral-400">{phone}</p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <a
            href={telHref}
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/30 transition-transform active:scale-[0.98]"
          >
            <Phone className="h-5 w-5 shrink-0" aria-hidden />
            Llamar
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/20 transition-transform active:scale-[0.98]"
          >
            <WhatsAppIcon className="h-5 w-5 shrink-0" />
            WhatsApp
          </a>
        </div>
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
        <p className="text-base font-bold text-white">{name}</p>
        <p className="text-sm text-neutral-400">{phone}</p>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={telHref}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-4 text-sm font-bold text-white"
          >
            <Phone className="h-5 w-5" aria-hidden />
            Llamar
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-4 text-sm font-bold text-white"
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </a>
        </div>
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
      <p className="text-sm font-medium text-neutral-300">{name}</p>
      <a
        href={telHref}
        className="flex min-h-[64px] items-center justify-center gap-3 rounded-2xl bg-green-600 px-6 py-4 text-lg font-black text-white shadow-lg active:scale-[0.98]"
      >
        <Phone className="h-7 w-7 shrink-0" aria-hidden />
        <span>
          Llamar a {name}
          <span className="mt-0.5 block text-sm font-semibold opacity-90">
            {phone}
          </span>
        </span>
      </a>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[56px] items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 text-lg font-bold text-white shadow-lg active:scale-[0.98]"
      >
        <WhatsAppIcon className="h-7 w-7 shrink-0" />
        WhatsApp a {name}
      </a>
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
}: ContactActionsProps) {
  const message = buildWhatsAppEmergencyMessage({
    beneficiaryName: profile.beneficiary_name,
    alertType,
    latitude,
    longitude,
    scannerNote,
    scanLogId,
  });

  const secondaryMessage = buildWhatsAppEmergencyMessage({
    beneficiaryName: profile.beneficiary_name,
    alertType,
    latitude,
    longitude,
    scannerNote,
    scanLogId,
  });

  const hasSecondary =
    profile.secondary_contact_phone?.trim() &&
    profile.secondary_contact_name?.trim();

  const isEmergency = variant === "emergency";

  return (
    <div className={`flex flex-col ${isEmergency ? "gap-3" : "gap-6"}`}>
      <ContactRow
        name={profile.emergency_contact_name}
        phone={profile.emergency_contact_phone}
        whatsAppMessage={message}
        label="Contacto principal"
        compact={compact && !isEmergency}
        emergency={isEmergency}
      />
      {hasSecondary && (
        <ContactRow
          name={profile.secondary_contact_name!}
          phone={profile.secondary_contact_phone!}
          whatsAppMessage={secondaryMessage}
          label="Contacto secundario"
          compact={compact && !isEmergency}
          emergency={isEmergency}
        />
      )}
    </div>
  );
}
