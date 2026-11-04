import { createECDH, createDecipheriv, hkdfSync, randomBytes, randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export class AssertionError extends Error {}

export function expect(condition, message) {
  if (!condition) throw new AssertionError(message);
}

export function expectStatus(res, expected, label = "") {
  const ok = Array.isArray(expected) ? expected.includes(res.status) : res.status === expected;
  if (!ok) {
    const body = res.text?.slice(0, 300) ?? "";
    throw new AssertionError(
      `${label ? `${label}: ` : ""}esperaba HTTP ${[].concat(expected).join("/")} y llegó ${res.status} ${body}`,
    );
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ipCounter = 0;
export function nextIp() {
  ipCounter += 1;
  return `10.77.${Math.floor(ipCounter / 250)}.${(ipCounter % 250) + 1}`;
}

export function createClient(baseUrl, { ip = nextIp(), label = "anon" } = {}) {
  const jar = new Map();
  const client = {
    ip,
    label,
    jar,
    cookieHeader() {
      return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
    setCookie(name, value) {
      jar.set(name, value);
    },
    /** Misma sesión desde otra IP (para no chocar con rate limits ajenos al caso). */
    rotateIp() {
      client.ip = nextIp();
      return client;
    },
    async request(method, path, { json, body, headers = {}, redirect = "manual" } = {}) {
      const finalHeaders = { "x-forwarded-for": client.ip, ...headers };
      if (jar.size) finalHeaders.cookie = client.cookieHeader();
      let payload = body;
      if (json !== undefined) {
        finalHeaders["content-type"] = "application/json";
        payload = JSON.stringify(json);
      }
      const started = Date.now();
      const res = await fetch(baseUrl + path, { method, headers: finalHeaders, body: payload, redirect });
      for (const raw of res.headers.getSetCookie?.() ?? []) {
        const [pair, ...attrs] = raw.split(";");
        const eq = pair.indexOf("=");
        const name = pair.slice(0, eq).trim();
        const value = pair.slice(eq + 1).trim();
        const expired = attrs.some((a) => /max-age=0/i.test(a.trim())) || value === "";
        if (expired) jar.delete(name);
        else jar.set(name, value);
      }
      const contentType = res.headers.get("content-type") ?? "";
      let text = null;
      let buffer = null;
      if (/json|text|html|csv|svg/.test(contentType) || !contentType) text = await res.text();
      else buffer = Buffer.from(await res.arrayBuffer());
      let data = null;
      if (text && contentType.includes("json")) {
        try {
          data = JSON.parse(text);
        } catch {
          /* no es JSON */
        }
      }
      return {
        status: res.status,
        headers: res.headers,
        json: data,
        text,
        buffer,
        location: res.headers.get("location"),
        ms: Date.now() - started,
      };
    },
    get: (path, opts) => client.request("GET", path, opts),
    post: (path, json, opts = {}) => client.request("POST", path, { json, ...opts }),
    patch: (path, json, opts = {}) => client.request("PATCH", path, { json, ...opts }),
    put: (path, json, opts = {}) => client.request("PUT", path, { json, ...opts }),
    del: (path, json, opts = {}) => client.request("DELETE", path, { json, ...opts }),
  };
  return client;
}

/** Suscripción Web Push falsa con claves reales, para poder descifrar lo que manda el servidor. */
export function createPushSubscription({ gone = false } = {}) {
  const ecdh = createECDH("prime256v1");
  ecdh.generateKeys();
  const auth = randomBytes(16);
  const id = randomUUID();
  return {
    endpoint: `https://push.qa.local/push/${gone ? "gone/" : ""}${id}`,
    path: `/push/${gone ? "gone/" : ""}${id}`,
    keys: {
      p256dh: ecdh.getPublicKey().toString("base64url"),
      auth: auth.toString("base64url"),
    },
    decrypt(bodyBase64) {
      const body = Buffer.from(bodyBase64, "base64");
      const salt = body.subarray(0, 16);
      const idLen = body.readUInt8(20);
      const serverPublic = body.subarray(21, 21 + idLen);
      const ciphertext = body.subarray(21 + idLen);
      const shared = ecdh.computeSecret(serverPublic);
      const keyInfo = Buffer.concat([
        Buffer.from("WebPush: info\0"),
        ecdh.getPublicKey(),
        serverPublic,
      ]);
      const ikm = Buffer.from(hkdfSync("sha256", shared, auth, keyInfo, 32));
      const cek = Buffer.from(hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: aes128gcm\0"), 16));
      const nonce = Buffer.from(hkdfSync("sha256", ikm, salt, Buffer.from("Content-Encoding: nonce\0"), 12));
      const decipher = createDecipheriv("aes-128-gcm", cek, nonce);
      decipher.setAuthTag(ciphertext.subarray(ciphertext.length - 16));
      let plain = Buffer.concat([
        decipher.update(ciphertext.subarray(0, ciphertext.length - 16)),
        decipher.final(),
      ]);
      let end = plain.length;
      while (end > 0 && plain[end - 1] === 0) end -= 1;
      plain = plain.subarray(0, end - 1);
      return JSON.parse(plain.toString("utf8"));
    },
  };
}

export function createContext({ baseUrl, infraUrl, env, runsDir }) {
  const results = [];
  const findings = [];
  const state = {};
  let currentSuite = null;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = join(runsDir, stamp);
  mkdirSync(outDir, { recursive: true });

  async function infra(method, path, json) {
    const res = await fetch(infraUrl + path, {
      method,
      headers: json ? { "content-type": "application/json" } : {},
      body: json ? JSON.stringify(json) : undefined,
    });
    return res.json();
  }

  const ctx = {
    baseUrl,
    env,
    state,
    outDir,
    expect,
    expectStatus,
    sleep,
    client: (opts) => createClient(baseUrl, opts),
    createPushSubscription,

    async sql(query, params = []) {
      const res = await infra("POST", "/qa/sql", { query, params });
      if (res.message) throw new Error(`SQL: ${res.message}`);
      return res.rows;
    },
    async mails() {
      return (await infra("GET", "/qa/mail")).mails;
    },
    async waitMail(predicate, { timeoutMs = 8000, label = "mail" } = {}) {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        const found = (await ctx.mails()).filter(predicate);
        if (found.length) return found[found.length - 1];
        await sleep(200);
      }
      throw new AssertionError(`No llegó el ${label} en ${timeoutMs / 1000}s`);
    },
    async pushes() {
      return (await infra("GET", "/qa/push")).pushes;
    },
    async pushesFor(subscription) {
      return (await ctx.pushes())
        .filter((p) => p.path === subscription.path)
        .map((p) => ({ ...p, payload: subscription.decrypt(p.body) }));
    },
    async waitPush(subscription, predicate = () => true, { timeoutMs = 8000, after = 0 } = {}) {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        const list = (await ctx.pushesFor(subscription)).slice(after).filter((p) => predicate(p.payload));
        if (list.length) return list[list.length - 1].payload;
        await sleep(200);
      }
      throw new AssertionError(`No llegó el push esperado en ${timeoutMs / 1000}s`);
    },
    async noPush(subscription, { waitMs = 2500, after = 0 } = {}) {
      await sleep(waitMs);
      return (await ctx.pushesFor(subscription)).slice(after);
    },
    async pushCount(subscription) {
      return (await ctx.pushesFor(subscription)).length;
    },
    async dbErrors() {
      return (await infra("GET", "/qa/stats")).errors;
    },

    /** Crea un tutor verificado por el flujo real (registro → mail → código). */
    async createVerifiedUser({ email, password = "QaPass123", fullName = "Tutor QA" } = {}) {
      const client = ctx.client({ label: email });
      const reg = await client.post("/api/auth/register", {
        email,
        password,
        fullName,
        acceptedTerms: true,
        declaredEligible: true,
      });
      expectStatus(reg, [200, 201], `registro ${email}`);
      const mail = await ctx.waitMail((m) => m.to.includes(email), { label: `mail de verificación a ${email}` });
      const code = /\b(\d{6})\b/.exec(mail.text || mail.html)?.[1];
      expect(code, `el mail de verificación a ${email} no trae un código de 6 dígitos`);
      const ver = await client.post("/api/auth/verify-email", { code });
      expectStatus(ver, 200, `verificación ${email}`);
      const me = await client.get("/api/auth/me");
      return { client, email, password, id: me.json?.user?.id ?? reg.json?.user?.id };
    },

    async createActivationCodes(profileType, count = 1, partner = "QA Partner") {
      const [batch] = await ctx.sql(
        `INSERT INTO qr_product_batches (partner_name, quantity, profile_type, product_label)
         VALUES ($1, $2, $3, 'QA') RETURNING id`,
        [partner, count, profileType],
      );
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const slugAlphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
      const codes = [];
      for (let i = 0; i < count; i++) {
        const code = Array.from(randomBytes(8), (b) => alphabet[b % alphabet.length]).join("");
        const slug = Array.from(randomBytes(21), (b) => slugAlphabet[b % 64]).join("");
        await ctx.sql(
          `INSERT INTO qr_activations (batch_id, activation_code, public_slug, status)
           VALUES ($1, $2, $3, 'unclaimed')`,
          [batch.id, code, slug],
        );
        codes.push({ code, slug });
      }
      return { batchId: batch.id, codes };
    },

    async suite(name, fn) {
      currentSuite = name;
      const started = Date.now();
      process.stdout.write(`\n▶ ${name}\n`);
      try {
        await fn(ctx);
      } catch (error) {
        ctx.record({
          id: `${name}:suite`,
          title: `La suite ${name} se cortó`,
          status: "fail",
          severity: "high",
          detail: error?.stack ?? String(error),
        });
      }
      process.stdout.write(`  (${((Date.now() - started) / 1000).toFixed(1)}s)\n`);
    },

    record(entry) {
      const full = { suite: currentSuite, severity: "medium", ...entry };
      results.push(full);
      const icon = { pass: "✔", fail: "✘", warn: "⚠", skip: "–" }[full.status] ?? "?";
      process.stdout.write(`  ${icon} ${full.title}${full.status !== "pass" && full.detail ? `\n      ${String(full.detail).split("\n")[0]}` : ""}\n`);
    },

    /**
     * Ejecuta un caso. Si lanza AssertionError → fail; otra excepción → fail con stack.
     * Devolver { warn: "texto" } marca aviso; { skip: "texto" } lo omite.
     */
    async check(title, fn, { severity = "medium", id } = {}) {
      const started = Date.now();
      try {
        const out = await fn();
        if (out?.skip) return ctx.record({ id, title, status: "skip", severity, detail: out.skip, ms: Date.now() - started });
        if (out?.warn) return ctx.record({ id, title, status: "warn", severity, detail: out.warn, ms: Date.now() - started });
        ctx.record({ id, title, status: "pass", severity, detail: out?.note, ms: Date.now() - started });
        return out;
      } catch (error) {
        ctx.record({
          id,
          title,
          status: "fail",
          severity,
          detail: error instanceof AssertionError ? error.message : error?.stack ?? String(error),
          ms: Date.now() - started,
        });
        return undefined;
      }
    },

    finding(entry) {
      findings.push({ suite: currentSuite, ...entry });
    },

    async finish() {
      const summary = { pass: 0, fail: 0, warn: 0, skip: 0 };
      for (const r of results) summary[r.status] = (summary[r.status] ?? 0) + 1;
      const dbErrors = await ctx.dbErrors().catch(() => []);
      const jsonPath = join(outDir, "results.json");
      writeFileSync(
        jsonPath,
        JSON.stringify({ finishedAt: new Date().toISOString(), summary, results, findings, dbErrors }, null, 2),
      );
      writeFileSync(join(outDir, "results.md"), renderMarkdown({ summary, results, findings, dbErrors }));
      return { summary, jsonPath };
    },
  };
  return ctx;
}

function renderMarkdown({ summary, results, findings, dbErrors }) {
  const lines = [
    `# Resultados QA (${new Date().toISOString()})`,
    "",
    `OK ${summary.pass} · Fallas ${summary.fail} · Avisos ${summary.warn} · Omitidos ${summary.skip}`,
    "",
  ];
  const bySuite = new Map();
  for (const r of results) {
    if (!bySuite.has(r.suite)) bySuite.set(r.suite, []);
    bySuite.get(r.suite).push(r);
  }
  for (const [suite, list] of bySuite) {
    lines.push(`## ${suite}`, "", "| Estado | Caso | Detalle |", "|---|---|---|");
    for (const r of list) {
      const detail = String(r.detail ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 300);
      lines.push(`| ${r.status} | ${r.title} | ${detail} |`);
    }
    lines.push("");
  }
  if (findings.length) {
    lines.push("## Hallazgos", "");
    for (const f of findings) lines.push(`- **[${f.severity}] ${f.title}** (${f.suite}): ${f.detail}`);
    lines.push("");
  }
  if (dbErrors.length) {
    lines.push("## Errores SQL vistos por la base", "");
    for (const e of dbErrors.slice(0, 50)) lines.push(`- ${e.message} — \`${e.query.replace(/\s+/g, " ").slice(0, 160)}\``);
  }
  return lines.join("\n");
}
