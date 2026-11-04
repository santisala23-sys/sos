#!/usr/bin/env node
// QA end-to-end local. Nunca toca producción: base en memoria, mails y push capturados.
//
//   npm run qa                 compila y corre todas las suites
//   npm run qa -- --skip-build reutiliza el build anterior de .next-qa
//   npm run qa -- --keep       deja servidores arriba para el recorrido en navegador
//   npm run qa -- --only=scan,push
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, createWriteStream } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import webpush from "web-push";
import { createContext } from "./lib.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = new Set(process.argv.slice(2));
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.slice(7).split(",")) : null;
const skipBuild = args.has("--skip-build");
const keep = args.has("--keep");

const APP_PORT = Number(process.env.QA_APP_PORT ?? 3100);
const DB_PORT = Number(process.env.QA_DB_PORT ?? 5499);
const SMTP_PORT = Number(process.env.QA_SMTP_PORT ?? 2525);
const runsDir = join(root, ".qa-runs");
mkdirSync(runsDir, { recursive: true });

const vapidPath = join(runsDir, "vapid.json");
if (!existsSync(vapidPath) || !skipBuild) {
  writeFileSync(vapidPath, JSON.stringify(webpush.generateVAPIDKeys()));
}
const vapid = JSON.parse(readFileSync(vapidPath, "utf8"));

const qaEnv = {
  ...process.env,
  NODE_ENV: "production",
  NEXT_DIST_DIR: ".next-qa",
  NEXT_TELEMETRY_DISABLED: "1",
  DATABASE_URL: "postgresql://qa:qa@qa.neon.local/qa",
  NEON_HTTP_ENDPOINT: `http://127.0.0.1:${DB_PORT}/sql`,
  AUTH_SECRET: "qa-local-secret-not-for-production-0123456789",
  NEXT_PUBLIC_APP_URL: `http://localhost:${APP_PORT}`,
  SMTP_HOST: "127.0.0.1",
  SMTP_PORT: String(SMTP_PORT),
  SMTP_USER: "qa",
  SMTP_PASS: "qa",
  EMAIL_FROM: "SOSme QA <qa@sosme.test>",
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: vapid.publicKey,
  VAPID_PRIVATE_KEY: vapid.privateKey,
  VAPID_SUBJECT: "mailto:qa@sosme.test",
  ADMIN_EMAILS: "admin@qa.test",
  CRON_SECRET: "qa-cron-secret",
  INTERNAL_N8N_KEY: "qa-n8n-key",
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: "",
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: "",
  NEXT_PUBLIC_GTM_ID: "",
  ALERT_WEBHOOK_URL: "",
  QA_DB_PORT: String(DB_PORT),
};

const children = [];
function start(name, cmd, cmdArgs, env, logFile) {
  const out = createWriteStream(join(runsDir, logFile));
  const child = spawn(cmd, cmdArgs, { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.pipe(out);
  child.stderr.pipe(out);
  children.push(child);
  child.on("exit", (code) => {
    if (code && code !== 0) console.error(`[qa] ${name} terminó con código ${code} (ver .qa-runs/${logFile})`);
  });
  return child;
}

function runToEnd(cmd, cmdArgs, env, logFile) {
  return new Promise((resolve, reject) => {
    const out = createWriteStream(join(runsDir, logFile));
    const child = spawn(cmd, cmdArgs, { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
    child.stdout.pipe(out);
    child.stderr.pipe(out);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} ${cmdArgs.join(" ")} falló (ver .qa-runs/${logFile})`)),
    );
  });
}

async function waitFor(url, label, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      /* todavía no */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${label} no respondió en ${timeoutMs / 1000}s`);
}

function shutdown() {
  for (const child of children) child.kill("SIGTERM");
}
process.on("SIGINT", () => {
  shutdown();
  process.exit(130);
});

const SUITES = [
  "public-pages",
  "auth",
  "activation",
  "profiles",
  "scan",
  "push",
  "chat",
  "sharing",
  "pet-health",
  "objects",
  "account",
  "store",
  "admin",
  "cron",
  "security",
];

try {
  console.log("[qa] levantando base en memoria, SMTP y receptor push…");
  start("infra", process.execPath, ["scripts/qa/infra.mjs"], qaEnv, "infra.log");
  await waitFor(`http://127.0.0.1:${DB_PORT}/qa/health`, "infra", 60_000);

  if (!skipBuild) {
    console.log("[qa] compilando Next (next build → .next-qa)…");
    await runToEnd(join(root, "node_modules/.bin/next"), ["build"], qaEnv, "build.log");
  }

  console.log(`[qa] sirviendo la app en http://localhost:${APP_PORT}`);
  start(
    "next",
    join(root, "node_modules/.bin/next"),
    ["start", "-p", String(APP_PORT)],
    { ...qaEnv, NODE_OPTIONS: `--require ${join(root, "scripts/qa/preload.cjs")}` },
    "next.log",
  );
  await waitFor(`http://localhost:${APP_PORT}/api/push/vapid-public-key`, "next start");

  const ctx = createContext({
    baseUrl: `http://localhost:${APP_PORT}`,
    infraUrl: `http://127.0.0.1:${DB_PORT}`,
    env: qaEnv,
    runsDir,
  });

  for (const name of SUITES) {
    if (only && !only.has(name)) continue;
    const mod = await import(pathToFileURL(join(root, "scripts/qa/suites", `${name}.mjs`)).href);
    await ctx.suite(name, mod.default);
  }

  const { summary, jsonPath } = await ctx.finish();
  console.log(
    `\n[qa] ${summary.pass} OK · ${summary.fail} fallas · ${summary.warn} avisos · ${summary.skip} omitidos  →  ${jsonPath}`,
  );

  if (keep) {
    console.log(`[qa] --keep: app en http://localhost:${APP_PORT}, Ctrl+C para cerrar.`);
    await new Promise(() => {});
  }
  shutdown();
  process.exit(summary.fail > 0 ? 1 : 0);
} catch (error) {
  console.error("[qa]", error instanceof Error ? error.message : error);
  shutdown();
  process.exit(2);
}
