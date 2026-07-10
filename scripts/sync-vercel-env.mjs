import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env.local");

const PRODUCTION_URL = "https://sosme.com.ar";

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

function vercelEnvAdd(name, value, environments) {
  for (const env of environments) {
    const result = spawnSync(
      "npx",
      [
        "vercel",
        "env",
        "add",
        name,
        env,
        "--value",
        value,
        "--yes",
        "--sensitive",
        "--force",
      ],
      { cwd: root, stdio: "pipe", shell: true },
    );
    const out = (result.stdout?.toString() ?? "") + (result.stderr?.toString() ?? "");
    if (result.status === 0) {
      console.log(`✓ ${name} → ${env}`);
    } else {
      console.error(`✗ ${name} → ${env}:`, out.trim());
    }
  }
}

const local = loadEnv();

console.log("Sincronizando variables en Vercel...\n");

if (local.ADMIN_EMAILS) {
  vercelEnvAdd("ADMIN_EMAILS", local.ADMIN_EMAILS, ["production", "preview"]);
}

vercelEnvAdd("NEXT_PUBLIC_APP_URL", PRODUCTION_URL, ["production"]);

const vapidKeys = [
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
];

for (const key of vapidKeys) {
  if (local[key]) {
    vercelEnvAdd(key, local[key], ["preview"]);
    vercelEnvAdd(key, local[key], ["production"]);
  }
}

console.log("\nListo. Redeploy en Vercel para aplicar cambios.");
