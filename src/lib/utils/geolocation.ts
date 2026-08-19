export type GeolocationFailureReason =
  | "unsupported"
  | "denied"
  | "timeout"
  | "unavailable";

export type GeolocationResult =
  | { ok: true; latitude: number; longitude: number }
  | { ok: false; reason: GeolocationFailureReason };

export function geolocationErrorMessage(reason: GeolocationFailureReason): string {
  switch (reason) {
    case "unsupported":
      return "Tu navegador no puede usar GPS en esta página. Probá con Chrome o Safari actualizado.";
    case "denied":
      return "El navegador bloqueó la ubicación. Revisá permisos del sitio sosme.com.ar en Ajustes.";
    case "timeout":
      return "El GPS tardó demasiado. Salí al aire libre o activá Wi‑Fi/datos e intentá de nuevo.";
    case "unavailable":
      return "No pudimos obtener una señal GPS ahora. Intentá de nuevo en unos segundos.";
  }
}

function mapGeolocationError(code: number): GeolocationFailureReason {
  if (code === GeolocationPositionError.PERMISSION_DENIED) return "denied";
  if (code === GeolocationPositionError.TIMEOUT) return "timeout";
  return "unavailable";
}

function readPosition(options: PositionOptions): Promise<GeolocationResult> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({ ok: false, reason: "unsupported" });
      return;
    }

    if (typeof window !== "undefined" && !window.isSecureContext) {
      resolve({ ok: false, reason: "unsupported" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          ok: true,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (error) => resolve({ ok: false, reason: mapGeolocationError(error.code) }),
      options,
    );
  });
}

/** Pide ubicación con reintento en modo menos exigente (mejor en interiores / iOS). */
export async function requestGeolocation(): Promise<GeolocationResult> {
  const accurate = await readPosition({
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 120_000,
  });

  if (accurate.ok) return accurate;

  if (accurate.reason === "denied" || accurate.reason === "unsupported") {
    return accurate;
  }

  const fallback = await readPosition({
    enableHighAccuracy: false,
    timeout: 25000,
    maximumAge: 600_000,
  });

  return fallback;
}
