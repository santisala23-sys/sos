import webpush from "web-push";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");

function loadEnv() {
  const env = {};
  if (!existsSync(envPath)) return env;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = { ...process.env, ...loadEnv() };
const publicKey = env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
const privateKey = env.VAPID_PRIVATE_KEY?.trim();
const subject = env.VAPID_SUBJECT?.trim() || "mailto:somososme@gmail.com";

if (!publicKey || !privateKey) {
  console.error("Faltan NEXT_PUBLIC_VAPID_PUBLIC_KEY o VAPID_PRIVATE_KEY en .env.local");
  process.exit(1);
}

try {
  webpush.setVapidDetails(subject, publicKey, privateKey);
  console.log("✓ Formato VAPID válido");
  console.log(`  Public:  ${publicKey.slice(0, 24)}...`);
  console.log(`  Subject: ${subject}`);
  console.log("\nSi push falla con 401/403 en producción, public y private en Vercel");
  console.log("deben ser del MISMO par generado con scripts/generate-vapid-keys.mjs");
  console.log("Luego hacé redeploy y reactivá alertas en cada celular.");
} catch (error) {
  console.error("✗ Par VAPID inválido:", error instanceof Error ? error.message : error);
  process.exit(1);
}
