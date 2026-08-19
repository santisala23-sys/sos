import { ExternalLink } from "lucide-react";
import type { ObjectSavedLocation } from "@/types/database";
import { getGoogleMapsUrl } from "@/lib/alerts/send-alert";
import { formatDateTime } from "@/lib/utils/format";

type ObjectSavedLocationsHistoryProps = {
  beneficiaryName: string;
  locations: ObjectSavedLocation[];
};

export function ObjectSavedLocationsHistory({
  beneficiaryName,
  locations,
}: ObjectSavedLocationsHistoryProps) {
  if (locations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400">
        Ubicaciones guardadas
      </h2>
      <ul className="space-y-2">
        {locations.map((location, index) => {
          const mapsUrl = getGoogleMapsUrl(
            Number(location.latitude),
            Number(location.longitude),
          );
          const label =
            index === 0 ? "Última ubicación" : `Ubicación ${locations.length - index}`;

          return (
            <li
              key={location.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-sky-950">{label}</p>
                <p className="text-xs text-sky-800/80">
                  {formatDateTime(location.created_at)}
                </p>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-800 transition-colors hover:bg-sky-100"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Abrir en Maps
              </a>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-neutral-500">
        Cada escaneo del QR de {beneficiaryName} permite guardar una nueva
        ubicación (por ejemplo, cada estacionamiento del día).
      </p>
    </div>
  );
}
