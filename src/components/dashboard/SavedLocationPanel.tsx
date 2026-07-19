import { ExternalLink, MapPin, MessageCircle } from "lucide-react";
import { getGoogleMapsUrl } from "@/lib/alerts/send-alert";
import { formatDateTime } from "@/lib/utils/format";

type SavedLocationPanelProps = {
  beneficiaryName: string;
  latitude: number;
  longitude: number;
  savedAt: string;
  compact?: boolean;
};

export function SavedLocationPanel({
  beneficiaryName,
  latitude,
  longitude,
  savedAt,
  compact = false,
}: SavedLocationPanelProps) {
  const mapsUrl = getGoogleMapsUrl(latitude, longitude);
  const waText = encodeURIComponent(
    `Última ubicación de ${beneficiaryName}: ${mapsUrl}\nMarcada: ${formatDateTime(savedAt)}`,
  );

  return (
    <div
      className={
        compact
          ? "rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3"
          : "rounded-2xl border border-sky-100 bg-sky-50/70 p-4"
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
          <MapPin className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-sky-900">Última ubicación</p>
          <p className="mt-0.5 text-xs text-sky-800/80">
            {formatDateTime(savedAt)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800 transition-colors hover:bg-sky-100"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Abrir en Maps
            </a>
            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Enviar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
