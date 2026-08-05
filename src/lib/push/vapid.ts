export function getServerVapidPublicKey(): string | null {
  const value = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  return value || null;
}

export function getServerVapidPrivateKey(): string | null {
  const value = process.env.VAPID_PRIVATE_KEY?.trim();
  return value || null;
}

export function getVapidSubject(): string {
  return process.env.VAPID_SUBJECT?.trim() || "mailto:somososme@gmail.com";
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

  return null;
}

export function describePushFailure(params: {
  statusCode?: number;
  expired?: boolean;
  vapidConfigured?: boolean;
  vapidHealthy?: boolean;
}): string {
  if (params.vapidConfigured === false || params.vapidHealthy === false) {
    return "Las claves push del servidor no están bien configuradas. Contactanos para que las regeneremos en Vercel.";
  }

  if (params.expired) {
    return "La suscripción de este dispositivo venció. Desactivá alertas, volvé a activarlas y probá otra vez.";
  }

  if (params.statusCode === 401 || params.statusCode === 403) {
    return "Las claves push del servidor no coinciden (VAPID). Contactanos para regenerarlas; después desactivá y reactivá alertas en el celular.";
  }

  if (params.statusCode === 400 || params.statusCode === 413) {
    return "Este dispositivo tiene una suscripción inválida. Desactivá alertas, volvé a activarlas desde el ícono de inicio y probá de nuevo.";
  }

  return "No pudimos entregar la prueba a este dispositivo. Desactivá alertas, volvé a activarlas desde el ícono de inicio y probá otra vez.";
}
