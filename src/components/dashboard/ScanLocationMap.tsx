import {
  getGoogleMapsEmbedUrl,
  getGoogleMapsUrl,
} from "@/lib/alerts/send-alert";

type ScanLocationMapProps = {
  latitude: number;
  longitude: number;
  approximate?: boolean;
  title?: string;
  className?: string;
};

export function ScanLocationMap({
  latitude,
  longitude,
  approximate = false,
  title = "Mapa de ubicación del escaneo",
  className = "h-72 w-full sm:h-80",
}: ScanLocationMapProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <iframe
        title={title}
        src={getGoogleMapsEmbedUrl(latitude, longitude, approximate)}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {approximate && (
        <>
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <div className="h-40 w-40 rounded-full border-[3px] border-violet-500/75 bg-violet-500/25 shadow-lg shadow-violet-500/25 sm:h-52 sm:w-52" />
          </div>
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600 ring-2 ring-white"
            aria-hidden
          />
        </>
      )}
    </div>
  );
}

export function getScanLocationMapsUrl(
  latitude: number,
  longitude: number,
): string {
  return getGoogleMapsUrl(latitude, longitude);
}
