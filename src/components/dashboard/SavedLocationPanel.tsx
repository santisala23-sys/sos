import { ExternalLink, MapPin, MessageCircle } from "lucide-react";
import { getGoogleMapsUrl } from "@/lib/alerts/send-alert";
import { formatDateTime } from "@/lib/utils/format";

type SavedLocationPanelProps = {
  beneficiaryName: string;
  latitude: number;
  longitude: number;
  savedAt: string;
  compact?: boolean;
  variant?: "default" | "compact" | "banner";
  profileHref?: string;
};

export function SavedLocationPanel({
  beneficiaryName,
  latitude,
  longitude,
  savedAt,
  compact = false,
  variant,
  profileHref,
}: SavedLocationPanelProps) {
  const resolvedVariant = variant ?? (compact ? "compact" : "default");
  const mapsUrl = getGoogleMapsUrl(latitude, longitude);
  const waText = encodeURIComponent(
    `Última ubicación de ${beneficiaryName}: ${mapsUrl}\nMarcada: ${formatDateTime(savedAt)}`,
  );

  const containerClass =
    resolvedVariant === "banner"
      ? "rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50/80 p-5 shadow-lg shadow-sky-500/10"
      : resolvedVariant === "compact"
        ? "rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3"
        : "rounded-2xl border border-sky-100 bg-sky-50/70 p-4";

  const title =
    resolvedVariant === "banner"
      ? `Última ubicación guardada para ${beneficiaryName}`
      : "Última ubicación";

  return (
    <div className={containerClass}>
      <div className="flex items-start gap-3">
        <span
          className={`flex shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 ${
            resolvedVariant === "banner" ? "h-11 w-11" : "h-9 w-9"
          }`}
        >
          <MapPin
            className={resolvedVariant === "banner" ? "h-5 w-5" : "h-4 w-4"}
            aria-hidden
          />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={
              resolvedVariant === "banner"
                ? "text-base font-black text-sky-950"
                : "text-sm font-bold text-sky-900"
            }
          >
            {title}
          </p>
          <p
            className={`mt-0.5 ${
              resolvedVariant === "banner"
                ? "text-sm text-sky-800/90"
                : "text-xs text-sky-800/80"
            }`}
          >
            {formatDateTime(savedAt)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white font-semibold text-sky-800 transition-colors hover:bg-sky-100 ${
                resolvedVariant === "banner"
                  ? "px-4 py-2 text-sm"
                  : "px-3 py-1.5 text-xs"
              }`}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Abrir en Maps
            </a>
            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 ${
                resolvedVariant === "banner"
                  ? "px-4 py-2 text-sm"
                  : "px-3 py-1.5 text-xs"
              }`}
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Enviar por WhatsApp
            </a>
            {profileHref && resolvedVariant === "banner" && (
              <a
                href={profileHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-800 transition-colors hover:bg-violet-50"
              >
                Ver perfil del objeto
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
