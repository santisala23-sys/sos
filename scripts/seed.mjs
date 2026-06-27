import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool, neonConfig } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
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

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL no está configurada");
  process.exit(1);
}

neonConfig.webSocketConstructor = ws;

const DEMO_PASSWORD = "demo1234";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

const pool = new Pool({ connectionString: url });

async function seed() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // -------------------------------------------------------------------------
  // 1. Tutor / familiar (único rol con cuenta y login)
  // -------------------------------------------------------------------------
  const tutorResult = await pool.query(
    `
    INSERT INTO users (email, password_hash, full_name)
    VALUES ($1, $2, $3)
    ON CONFLICT (email) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          password_hash = EXCLUDED.password_hash
    RETURNING id
    `,
    ["tutor@sos.demo", passwordHash, "María García (tutora)"],
  );
  const tutorId = tutorResult.rows[0].id;

  // -------------------------------------------------------------------------
  // 2. Perfiles QR de ejemplo (personas con discapacidad — sin login propio)
  // -------------------------------------------------------------------------
  const profiles = [
    {
      slug: "juan-perez-demo",
      beneficiary_name: "Juan Pérez",
      emergency_contact_name: "María García",
      emergency_contact_phone: "+5491123456789",
      instructions:
        "No tolera contacto físico sin avisar. Hablarle pausado y con calma. Sensible a sirenas y luces fuertes. Puede repetir frases cuando está nervioso.",
      medical_notes: "Epilepsia controlada con medicación. Alergia a penicilina.",
      is_active: true,
    },
    {
      slug: "sofia-lopez-demo",
      beneficiary_name: "Sofía López",
      emergency_contact_name: "María García",
      emergency_contact_phone: "+5491198765432",
      instructions:
        "Usa comunicación aumentativa (tarjetas en su mochila). No asumir que no entiende: explicar con paciencia. Prefiere espacios tranquilos.",
      medical_notes: "Autismo. No requiere medicación de emergencia.",
      is_active: true,
    },
  ];

  for (const p of profiles) {
    await pool.query(
      `
      INSERT INTO qr_profiles (
        tutor_id, slug, beneficiary_name, emergency_contact_name,
        emergency_contact_phone, instructions, medical_notes, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (slug) DO UPDATE
        SET beneficiary_name = EXCLUDED.beneficiary_name,
            emergency_contact_name = EXCLUDED.emergency_contact_name,
            emergency_contact_phone = EXCLUDED.emergency_contact_phone,
            instructions = EXCLUDED.instructions,
            medical_notes = EXCLUDED.medical_notes,
            is_active = EXCLUDED.is_active,
            tutor_id = EXCLUDED.tutor_id
      `,
      [
        tutorId,
        p.slug,
        p.beneficiary_name,
        p.emergency_contact_name,
        p.emergency_contact_phone,
        p.instructions,
        p.medical_notes,
        p.is_active,
      ],
    );
  }

  await pool.end();

  console.log("\n✅ Datos de ejemplo cargados\n");
  console.log("── ROL 1: Tutor / familiar (con login) ──");
  console.log("  Email:    tutor@sos.demo");
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log("  Panel:    /dashboard\n");
  console.log("── ROL 2: Persona con discapacidad (sin login — solo QR/enlace) ──");
  for (const p of profiles) {
    console.log(`  ${p.beneficiary_name}`);
    console.log(`  URL pública: ${APP_URL}/p/${p.slug}`);
  }
  console.log("\n── ROL 3: Quien escanea (policía, médico, transeúnte) ──");
  console.log("  No tiene cuenta. Al escanear el QR ve la vista de emergencia.");
  console.log(`  Probalo: ${APP_URL}/p/juan-perez-demo\n`);
}

seed().catch((error) => {
  console.error("Error al cargar seed:", error);
  process.exit(1);
});
