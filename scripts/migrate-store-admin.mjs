/**
 * Migraciones de tienda/admin: galería de imágenes + descuento %.
 * Requiere DATABASE_URL (.env.local o entorno).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL no está configurada (ponela en .env.local)");
  process.exit(1);
}

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const files = [
  "041_store_product_gallery_urls.sql",
  "042_store_product_discount_percent.sql",
];

for (const file of files) {
  const sql = readFileSync(join(root, "db/migrations", file), "utf8");
  process.stdout.write(`${file}... `);
  await pool.query(sql);
  console.log("OK");
}

await pool.end();
console.log("Listo: tienda/admin con gallery_urls y discount_percent.");
