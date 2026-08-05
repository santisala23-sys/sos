export function getServerVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
}

export async function getClientVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch("/api/push/vapid-public-key", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { publicKey?: string | null };
      if (data.publicKey) return data.publicKey;
    }
  } catch {
    /* ignore */
  }

  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
}

export function describePushFailure(params: {
  statusCode?: number;
  expired?: boolean;
  vapidConfigured?: boolean;
}): string {
  if (params.vapidConfigured === false) {
    return "Push no está configurado en el servidor. Contactanos.";
  }

  if (params.expired) {
    return "La suscripción de este dispositivo venció. Desactivá alertas, volvé a activarlas y probá otra vez.";
  }

  if (params.statusCode === 401 || params.statusCode === 403) {
    return "Hay un problema de configuración push en el servidor (VAPID). Desactivá y reactivá alertas; si sigue fallando, contactanos.";
  }

  if (params.statusCode === 400 || params.statusCode === 413) {
    return "Este dispositivo tiene una suscripción inválida. Desactivá alertas, volvé a activarlas desde el ícono de inicio y probá de nuevo.";
  }

  return "No pudimos entregar la prueba a este dispositivo. Desactivá alertas, volvé a activarlas desde el ícono de inicio y probá otra vez.";
}
