import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "@neondatabase/serverless";

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
const migrationPath = join(__dirname, "../db/migrations/001_initial_schema.sql");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL no está configurada");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
const migration = readFileSync(migrationPath, "utf8");

try {
  await pool.query(migration);
  await pool.end();
  console.log("Migración aplicada correctamente en Neon.");
} catch (error) {
  console.error("Error al aplicar migración:", error);
  process.exit(1);
}
