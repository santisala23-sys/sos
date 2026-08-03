export type RequestGeo = {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
};

export function getApproximateGeoFromRequest(
  request: Request,
): RequestGeo | null {
  const latHeader = request.headers.get("x-vercel-ip-latitude");
  const lngHeader = request.headers.get("x-vercel-ip-longitude");
  if (!latHeader || !lngHeader) return null;

  const latitude = Number(latHeader);
  const longitude = Number(lngHeader);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const city = request.headers.get("x-vercel-ip-city")?.trim() || undefined;
  const region =
    request.headers.get("x-vercel-ip-country-region")?.trim() || undefined;
  const country = request.headers.get("x-vercel-ip-country")?.trim() || undefined;

  return { latitude, longitude, city, region, country };
}

export function formatApproximateArea(geo: Pick<
  RequestGeo,
  "city" | "region" | "country"
>): string {
  const parts = [geo.city, geo.region, geo.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "zona del escaneo";
}
