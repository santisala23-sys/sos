import webpush from "web-push";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env.local");
const subject = "mailto:somososme@gmail.com";

const keys = webpush.generateVAPIDKeys();

const lines = [
  "# Web Push — generado con scripts/setup-vapid.mjs",
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`,
  `VAPID_PRIVATE_KEY=${keys.privateKey}`,
  `VAPID_SUBJECT=${subject}`,
  "",
];

if (existsSync(envPath)) {
  const current = readFileSync(envPath, "utf8");
  const withoutOld = current
    .split("\n")
    .filter(
      (line) =>
        !line.startsWith("NEXT_PUBLIC_VAPID_PUBLIC_KEY=") &&
        !line.startsWith("VAPID_PRIVATE_KEY=") &&
        !line.startsWith("VAPID_SUBJECT=") &&
        !line.startsWith("# Web Push — generado"),
    )
    .join("\n")
    .trimEnd();
  writeFileSync(envPath, `${withoutOld}\n\n${lines.join("\n")}`, "utf8");
} else {
  writeFileSync(envPath, `${lines.join("\n")}`, "utf8");
}

console.log("Claves VAPID nuevas guardadas en .env.local\n");
console.log("Copiá estas 3 variables en Vercel → Settings → Environment Variables (Production):");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=${subject}`);
console.log("\nDespués: Redeploy en Vercel y reactivá alertas en cada celular.");
