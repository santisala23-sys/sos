// Infraestructura descartable para QA local:
//   - Base Postgres en memoria (PGlite) expuesta con el protocolo HTTP de Neon.
//   - Receptor SMTP que guarda los mails en memoria.
//   - Receptor Web Push que guarda los envíos cifrados.
//   - API /qa/* para que los tests consulten y siembren datos.
import { createServer } from "node:http";
import { createServer as createTcpServer } from "node:net";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DB_PORT = Number(process.env.QA_DB_PORT ?? 5499);
const SMTP_PORT = Number(process.env.QA_SMTP_PORT ?? 2525);

const db = await PGlite.create({ extensions: { pgcrypto } });

const migrationFiles = readdirSync(join(root, "db/migrations"))
  .filter((f) => f.endsWith(".sql"))
  .sort();
for (const file of migrationFiles) {
  await db.exec(readFileSync(join(root, "db/migrations", file), "utf8"));
}

const rawParsers = {};
for (let oid = 0; oid < 20000; oid++) rawParsers[oid] = (value) => value;

const stats = { queries: 0, errors: [] };

async function runNeonQuery(target, { query, params }) {
  stats.queries += 1;
  const result = await target.query(query, params ?? [], {
    rowMode: "array",
    parsers: rawParsers,
  });
  return {
    fields: result.fields,
    rows: result.rows,
    rowCount: result.affectedRows ?? result.rows.length,
    command: query.trim().split(/\s+/)[0]?.toUpperCase() ?? "",
  };
}

function neonError(error) {
  const body = { message: error?.message ?? String(error) };
  for (const key of [
    "severity",
    "code",
    "detail",
    "hint",
    "position",
    "internalPosition",
    "internalQuery",
    "where",
    "schema",
    "table",
    "column",
    "dataType",
    "constraint",
    "file",
    "line",
    "routine",
  ]) {
    if (error?.[key] != null) body[key] = String(error[key]);
  }
  return body;
}

const mails = [];
const pushes = [];

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

const http = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (req.method === "POST" && url.pathname === "/sql") {
      const body = JSON.parse((await readBody(req)).toString("utf8"));
      try {
        if (Array.isArray(body.queries)) {
          const results = await db.transaction(async (tx) => {
            const out = [];
            for (const q of body.queries) out.push(await runNeonQuery(tx, q));
            return out;
          });
          return sendJson(res, 200, { results });
        }
        return sendJson(res, 200, await runNeonQuery(db, body));
      } catch (error) {
        stats.errors.push({
          at: new Date().toISOString(),
          message: error?.message,
          query: (body.query ?? body.queries?.[0]?.query ?? "").slice(0, 400),
        });
        return sendJson(res, 400, neonError(error));
      }
    }

    if (url.pathname.startsWith("/push/")) {
      const body = await readBody(req);
      const entry = {
        at: new Date().toISOString(),
        path: url.pathname,
        headers: req.headers,
        body: body.toString("base64"),
      };
      pushes.push(entry);
      if (url.pathname.includes("/gone/")) {
        res.writeHead(410);
        return res.end("gone");
      }
      res.writeHead(201);
      return res.end();
    }

    if (url.pathname === "/qa/health") return sendJson(res, 200, { ok: true });
    if (url.pathname === "/qa/stats") return sendJson(res, 200, stats);

    if (req.method === "POST" && url.pathname === "/qa/sql") {
      const { query, params } = JSON.parse((await readBody(req)).toString("utf8"));
      try {
        const result = await db.query(query, params ?? []);
        return sendJson(res, 200, { rows: result.rows, affectedRows: result.affectedRows });
      } catch (error) {
        return sendJson(res, 400, neonError(error));
      }
    }

    if (url.pathname === "/qa/mail") {
      if (req.method === "DELETE") {
        mails.length = 0;
        return sendJson(res, 200, { ok: true });
      }
      return sendJson(res, 200, { mails });
    }

    if (url.pathname === "/qa/push") {
      if (req.method === "DELETE") {
        pushes.length = 0;
        return sendJson(res, 200, { ok: true });
      }
      return sendJson(res, 200, { pushes });
    }

    sendJson(res, 404, { error: "not found" });
  } catch (error) {
    sendJson(res, 500, { error: error?.message ?? String(error) });
  }
});

function decodeQuotedPrintable(text) {
  return Buffer.from(
    text
      .replace(/=\r?\n/g, "")
      .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))),
    "latin1",
  ).toString("utf8");
}

function decodeMimeWords(value) {
  return value.replace(/\?=\s+=\?/g, "?==?").replace(/=\?([^?]+)\?([QB])\?([^?]*)\?=/gi, (_, _charset, enc, data) =>
    enc.toUpperCase() === "B"
      ? Buffer.from(data, "base64").toString("utf8")
      : decodeQuotedPrintable(data.replace(/_/g, " ")),
  );
}

function parseMail(raw, envelope) {
  const [headerBlock] = raw.split(/\r?\n\r?\n/);
  const headers = {};
  for (const line of headerBlock.replace(/\r?\n[ \t]+/g, " ").split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx > 0) headers[line.slice(0, idx).toLowerCase()] = line.slice(idx + 1).trim();
  }

  const parts = [];
  const boundaryMatch = /boundary="?([^";]+)"?/i.exec(raw);
  const segments = boundaryMatch ? raw.split(`--${boundaryMatch[1]}`) : [raw];
  for (const segment of segments) {
    const split = segment.search(/\r?\n\r?\n/);
    if (split === -1) continue;
    const head = segment.slice(0, split).toLowerCase();
    let body = segment.slice(split).replace(/^\r?\n\r?\n/, "");
    if (head.includes("quoted-printable")) body = decodeQuotedPrintable(body);
    else if (head.includes("base64")) body = Buffer.from(body.replace(/\s+/g, ""), "base64").toString("utf8");
    if (head.includes("text/plain")) parts.push({ type: "text", body });
    else if (head.includes("text/html")) parts.push({ type: "html", body });
  }

  return {
    at: new Date().toISOString(),
    from: envelope.from,
    to: envelope.to,
    subject: decodeMimeWords(headers.subject ?? ""),
    text: parts.find((p) => p.type === "text")?.body ?? "",
    html: parts.find((p) => p.type === "html")?.body ?? "",
  };
}

const smtp = createTcpServer((socket) => {
  let envelope = { from: null, to: [] };
  let inData = false;
  let dataBuffer = "";
  let pending = "";
  let authStep = null;

  const debug = process.env.QA_DEBUG ? (msg) => console.log(`[smtp] ${msg}`) : () => {};
  const reply = (line) => {
    debug(`> ${line}`);
    socket.write(`${line}\r\n`);
  };
  debug(`conexión desde ${socket.remoteAddress}`);
  reply("220 qa-smtp ready");

  socket.on("data", (chunk) => {
    if (!inData) debug(`< ${chunk.toString("utf8").trim().slice(0, 80)}`);
    pending += chunk.toString("utf8");
    while (true) {
      if (inData) {
        dataBuffer += pending;
        pending = "";
        const end = dataBuffer.indexOf("\r\n.\r\n");
        if (end === -1) return;
        pending = dataBuffer.slice(end + 5);
        dataBuffer = dataBuffer.slice(0, end);
        inData = false;
        mails.push(parseMail(dataBuffer.replace(/\r\n\.\./g, "\r\n."), envelope));
        dataBuffer = "";
        envelope = { from: null, to: [] };
        reply("250 OK queued");
        continue;
      }
      const nl = pending.indexOf("\r\n");
      if (nl === -1) return;
      const line = pending.slice(0, nl);
      pending = pending.slice(nl + 2);

      if (authStep === "login-user") {
        authStep = "login-pass";
        reply("334 UGFzc3dvcmQ6");
        continue;
      }
      if (authStep === "login-pass") {
        authStep = null;
        reply("235 Authentication successful");
        continue;
      }

      const cmd = line.slice(0, 4).toUpperCase();
      if (cmd === "EHLO") {
        socket.write("250-qa-smtp\r\n250-AUTH PLAIN LOGIN\r\n250 8BITMIME\r\n");
      } else if (cmd === "HELO") reply("250 qa-smtp");
      else if (cmd === "AUTH") {
        if (/^AUTH LOGIN/i.test(line)) {
          authStep = "login-user";
          reply("334 VXNlcm5hbWU6");
        } else reply("235 Authentication successful");
      } else if (cmd === "MAIL") {
        envelope.from = /<([^>]*)>/.exec(line)?.[1] ?? null;
        reply("250 OK");
      } else if (cmd === "RCPT") {
        envelope.to.push(/<([^>]*)>/.exec(line)?.[1] ?? "");
        reply("250 OK");
      } else if (cmd === "DATA") {
        inData = true;
        reply("354 End data with <CR><LF>.<CR><LF>");
      } else if (cmd === "QUIT") {
        reply("221 Bye");
        socket.end();
      } else reply("250 OK");
    }
  });
  socket.on("error", () => {});
});

http.listen(DB_PORT, "127.0.0.1", () => {
  smtp.listen(SMTP_PORT, "127.0.0.1", () => {
    console.log(`[qa-infra] ready db=${DB_PORT} smtp=${SMTP_PORT} migrations=${migrationFiles.length}`);
  });
});
