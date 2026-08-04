export function describePushDevice(userAgent: string | null | undefined): string {
  if (!userAgent?.trim()) return "Dispositivo desconocido";

  const ua = userAgent.toLowerCase();
  if (ua.includes("iphone")) return "iPhone";
  if (ua.includes("ipad")) return "iPad";
  if (ua.includes("android") && ua.includes("mobile")) return "Celular Android";
  if (ua.includes("android")) return "Tablet Android";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "Mac";
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("linux")) return "Linux";
  return "Navegador web";
}

export function describePushBrowser(userAgent: string | null | undefined): string {
  if (!userAgent?.trim()) return "";

  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("crios/")) return "Chrome";
  if (ua.includes("fxios/")) return "Firefox";
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  return "";
}

export function formatPushDeviceLabel(userAgent: string | null | undefined): string {
  const device = describePushDevice(userAgent);
  const browser = describePushBrowser(userAgent);
  return browser ? `${device} · ${browser}` : device;
}

export type PushDeviceRow = {
  id: string;
  endpoint: string;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
};

export type PushDeviceSummary = {
  id: string;
  endpoint: string;
  label: string;
  createdAt: string;
  updatedAt: string;
  isCurrent: boolean;
};

export function toPushDeviceSummary(
  row: PushDeviceRow,
  currentEndpoint: string | null,
): PushDeviceSummary {
  return {
    id: row.id,
    endpoint: row.endpoint,
    label: formatPushDeviceLabel(row.user_agent),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isCurrent: Boolean(currentEndpoint && row.endpoint === currentEndpoint),
  };
}
