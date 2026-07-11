import { neon, neonConfig } from "@neondatabase/serverless";

// Reutiliza conexiones HTTP entre invocaciones en la misma instancia serverless (Vercel).
neonConfig.fetchConnectionCache = true;

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL no está configurada");
  }
  return neon(url);
}
