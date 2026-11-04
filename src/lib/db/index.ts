import { neon, neonConfig } from "@neondatabase/serverless";

// Local Neon HTTP proxy (e.g. scripts/qa). Unset in production.
if (process.env.NEON_HTTP_ENDPOINT) {
  neonConfig.fetchEndpoint = process.env.NEON_HTTP_ENDPOINT;
}

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL no está configurada");
  }
  return neon(url);
}
