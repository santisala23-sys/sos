import {
  getGoogleMapsEmbedUrl,
  getGoogleMapsUrl,
  getOsmEmbedUrl,
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
  if (approximate) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <iframe
          title={title}
          src={getOsmEmbedUrl(latitude, longitude)}
          className="h-full w-full scale-[1.02] border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          tabIndex={-1}
        />
        <div
          className="absolute inset-0 z-10 cursor-default touch-none"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          aria-hidden
        >
          <div className="h-40 w-40 rounded-full border-[3px] border-violet-500/80 bg-violet-500/30 shadow-lg shadow-violet-500/30 sm:h-52 sm:w-52" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <iframe
        title={title}
        src={getGoogleMapsEmbedUrl(latitude, longitude, false)}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}

export function getScanLocationMapsUrl(
  latitude: number,
  longitude: number,
): string {
  return getGoogleMapsUrl(latitude, longitude);
}
