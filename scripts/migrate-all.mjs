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
  console.error("DATABASE_URL no está configurada");
  process.exit(1);
}

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const migrations = [
  "001_initial_schema.sql",
  "002_scan_logs_notes_and_read.sql",
  "003_secondary_contacts_and_push.sql",
  "004_scan_messages.sql",
  "005_allergies_and_clinical_pdf.sql",
  "006_profile_type.sql",
  "007_google_auth.sql",
  "008_scanner_push_and_session.sql",
  "008_blood_type.sql",
  "009_security_and_admin.sql",
  "010_legal_consent.sql",
  "011_registration_eligibility.sql",
  "012_freemium_and_product_qr.sql",
  "013_store_products_orders.sql",
  "014_legal_entity_settings.sql",
  "015_account_self_service_and_purge.sql",
  "016_print_templates.sql",
];

for (const file of migrations) {
  const path = join(root, "db/migrations", file);
  const sql = readFileSync(path, "utf8");
  process.stdout.write(`Aplicando ${file}... `);
  try {
    await pool.query(sql);
    console.log("OK");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("already exists") ||
      message.includes("duplicate_object")
    ) {
      console.log("omitido (ya aplicada)");
    } else {
      console.error("FALLÓ");
      console.error(message);
      await pool.end();
      process.exit(1);
    }
  }
}

await pool.end();
console.log("\nTodas las migraciones procesadas.");
