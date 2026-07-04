/**
 * Exporta QR de activación de un lote para imprenta.
 *
 * Uso:
 *   npm run qr:export -- --list
 *   npm run qr:export -- --batch-id <uuid>
 *   npm run qr:export -- --csv ruta/al/lote.csv
 *
 * Opciones:
 *   --output <dir>       Carpeta destino (default: exports/lote-<id>)
 *   --template <tipo>    llavero | credencial | valija | sticker | minimal
 *   --only-unclaimed     Solo códigos sin activar
 *   --app-url <url>      Base URL (default: NEXT_PUBLIC_APP_URL o localhost)
 */

import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool, neonConfig } from "@neondatabase/serverless";
import QRCode from "qrcode";
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

const TEMPLATES = {
  llavero: {
    label: "Llavero",
    width: 500,
    height: 300,
    lines: ["SCAN ME IF YOU FIND ME", "sosme.app"],
    qrSize: 170,
    qrY: 85,
  },
  credencial: {
    label: "Credencial",
    width: 856,
    height: 540,
    brand: "SOSme",
    lines: ["EMERGENCIA", "Escaneá para contactar", "sosme.app"],
    qrSize: 260,
    qrY: 175,
  },
  valija: {
    label: "Tarjeta valija/mochila",
    width: 700,
    height: 400,
    brand: "SOSme",
    lines: ["IF FOUND · SCAN ME", "sosme.app"],
    qrSize: 210,
    qrY: 110,
  },
  sticker: {
    label: "Sticker",
    width: 500,
    height: 500,
    brand: "SOSme",
    lines: ["sosme.app"],
    qrSize: 300,
    qrY: 120,
  },
  minimal: {
    label: "Solo QR",
    width: 400,
    height: 400,
    lines: [],
    qrSize: 340,
    qrY: 30,
  },
};

function parseArgs(argv) {
  const args = {
    list: false,
    batchId: null,
    csv: null,
    output: null,
    template: null,
    onlyUnclaimed: false,
    appUrl:
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "http://localhost:3000",
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--list" || arg === "--list-batches") args.list = true;
    else if (arg === "--batch-id") args.batchId = argv[++i];
    else if (arg === "--csv") args.csv = argv[++i];
    else if (arg === "--output") args.output = argv[++i];
    else if (arg === "--template") args.template = argv[++i];
    else if (arg === "--only-unclaimed") args.onlyUnclaimed = true;
    else if (arg === "--app-url") args.appUrl = argv[++i]?.replace(/\/$/, "");
    else if (arg === "--help" || arg === "-h") args.help = true;
  }

  return args;
}

function printHelp() {
  console.log(`
Exportar QR de lote SOSme para imprenta

  npm run qr:export -- --list
  npm run qr:export -- --batch-id <uuid>
  npm run qr:export -- --csv exports/lote.csv

Opciones:
  --output <dir>         Carpeta de salida
  --template <tipo>      llavero | credencial | valija | sticker | minimal
  --only-unclaimed       Omitir códigos ya activados
  --app-url <url>        URL base (ej. https://sos-alpha-lime.vercel.app)

Salida:
  qr-only/               PNG del QR (1024px, listo para imprenta)
  labels/                SVG etiqueta completa con texto + código
  print-sheet.html       Hoja para abrir en navegador e imprimir / PDF
  manifest.json          Índice del lote
`);
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCsvLine(lines[i]);
    const row = {};
    header.forEach((key, idx) => {
      row[key] = values[idx] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function activationUrl(code, appUrl) {
  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `${appUrl}/activar/${normalized}`;
}

function detectTemplate(productLabel) {
  const text = (productLabel ?? "").toLowerCase();
  if (text.includes("llavero")) return "llavero";
  if (text.includes("credencial")) return "credencial";
  if (
    text.includes("valija") ||
    text.includes("mochila") ||
    text.includes("colgante") ||
    text.includes("enganche")
  ) {
    return "valija";
  }
  if (text.includes("sticker") || text.includes("etiqueta")) return "sticker";
  return "minimal";
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function qrPngBuffer(url) {
  return QRCode.toBuffer(url, {
    errorCorrectionLevel: "H",
    type: "png",
    width: 1024,
    margin: 2,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}

function buildLabelSvg({ templateKey, activationCode, qrDataUri }) {
  const template = TEMPLATES[templateKey];
  const { width, height, brand, lines, qrSize, qrY } = template;
  const qrX = (width - qrSize) / 2;
  const codeY = height - 36;

  const brandSvg = brand
    ? `<text x="${width / 2}" y="42" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800"><tspan fill="#111111">SOS</tspan><tspan fill="#7C3AED">me</tspan></text>`
    : "";

  const lineStartY = brand ? 72 : 36;
  const lineSvg = lines
    .map((line, idx) => {
      const y = lineStartY + idx * 22;
      const isFooter = line === "sosme.app";
      return `<text x="${width / 2}" y="${y}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${isFooter ? 16 : 14}" font-weight="${isFooter ? 600 : 700}" fill="${isFooter ? "#6B7280" : "#111111"}">${escapeXml(line)}</text>`;
    })
    .join("\n    ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  ${brandSvg}
  ${lineSvg}
  <image x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" href="${qrDataUri}"/>
  <text x="${width / 2}" y="${codeY}" text-anchor="middle" font-family="ui-monospace, monospace" font-size="14" font-weight="600" fill="#374151">${escapeXml(activationCode)}</text>
</svg>`;
}

function buildPrintSheetHtml({ batchMeta, items, templateKey }) {
  const template = TEMPLATES[templateKey];
  const cards = items
    .map(
      (item) => `
      <article class="label-card">
        <object data="labels/${item.filenameSvg}" type="image/svg+xml" class="label-svg"></object>
        <p class="meta">${item.activation_code} · ${item.status}</p>
      </article>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Lote ${escapeXml(batchMeta.id?.slice(0, 8) ?? "export")} — SOSme</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
    h1 { font-size: 1.25rem; margin-bottom: 0.25rem; }
    .sub { color: #666; font-size: 0.875rem; margin-bottom: 24px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(${Math.min(template.width + 24, 320)}px, 1fr));
      gap: 16px;
    }
    .label-card {
      border: 1px dashed #ccc;
      padding: 8px;
      break-inside: avoid;
      page-break-inside: avoid;
      text-align: center;
      background: #fff;
    }
    .label-svg { width: 100%; max-width: ${template.width}px; height: auto; }
    .meta { font-size: 11px; color: #666; margin: 6px 0 0; font-family: monospace; }
    @media print {
      body { margin: 8mm; }
      .label-card { border-color: #ddd; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <h1>Etiquetas SOSme — ${escapeXml(template.label)}</h1>
    <p class="sub">${escapeXml(batchMeta.partner_name ?? "")}${batchMeta.product_label ? ` · ${escapeXml(batchMeta.product_label)}` : ""} · ${items.length} unidades</p>
    <p class="sub">Imprimí esta página o llevá los SVG/PNG de <code>labels/</code> y <code>qr-only/</code> a la gráfica.</p>
  </div>
  <div class="grid">
    ${cards}
  </div>
</body>
</html>`;
}

async function loadFromDatabase(batchId) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL no configurada (.env.local)");
  }

  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: url });

  try {
    const batchRows = await pool.query(
      `SELECT id, partner_name, product_label, quantity, created_at
       FROM qr_product_batches WHERE id = $1`,
      [batchId],
    );

    if (!batchRows.rows[0]) {
      throw new Error(`Lote no encontrado: ${batchId}`);
    }

    const activationRows = await pool.query(
      `SELECT activation_code, public_slug, status, claimed_at
       FROM qr_activations
       WHERE batch_id = $1
       ORDER BY created_at ASC`,
      [batchId],
    );

    return {
      batch: batchRows.rows[0],
      activations: activationRows.rows,
    };
  } finally {
    await pool.end();
  }
}

async function listBatches() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL no configurada (.env.local)");
  }

  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: url });

  try {
    const { rows } = await pool.query(`
      SELECT
        b.id,
        b.partner_name,
        b.product_label,
        b.quantity,
        b.created_at,
        COUNT(*) FILTER (WHERE a.status = 'claimed')::int AS claimed_count,
        COUNT(*) FILTER (WHERE a.status = 'unclaimed')::int AS unclaimed_count
      FROM qr_product_batches b
      LEFT JOIN qr_activations a ON a.batch_id = b.id
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `);

    if (rows.length === 0) {
      console.log("No hay lotes. Creá uno en Admin → Lotes QR.");
      return;
    }

    console.log("\nLotes disponibles:\n");
    for (const row of rows) {
      console.log(`  ${row.id}`);
      console.log(
        `    ${row.partner_name}${row.product_label ? ` · ${row.product_label}` : ""}`,
      );
      console.log(
        `    ${row.quantity} generados · ${row.claimed_count} activados · ${row.unclaimed_count} sin activar`,
      );
      console.log(`    creado: ${row.created_at}\n`);
    }

    console.log("Exportar:");
    console.log(`  npm run qr:export -- --batch-id ${rows[0].id}\n`);
  } finally {
    await pool.end();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (args.list) {
    await listBatches();
    return;
  }

  if (!args.batchId && !args.csv) {
    printHelp();
    console.error("\nError: indicá --batch-id <uuid> o --csv <archivo>\n");
    process.exit(1);
  }

  let batchMeta = {
    id: args.batchId ?? basename(args.csv, ".csv"),
    partner_name: "",
    product_label: "",
  };
  let activations = [];

  if (args.csv) {
    if (!existsSync(args.csv)) {
      console.error(`CSV no encontrado: ${args.csv}`);
      process.exit(1);
    }
    const rows = parseCsv(readFileSync(args.csv, "utf8"));
    activations = rows.map((row) => ({
      activation_code: row.activation_code,
      public_slug: row.public_slug ?? "",
      status: row.status ?? "unclaimed",
      activation_url: row.activation_url,
    }));
  } else {
    const data = await loadFromDatabase(args.batchId);
    batchMeta = data.batch;
    activations = data.activations;
  }

  if (args.onlyUnclaimed) {
    activations = activations.filter((a) => a.status === "unclaimed");
  }

  if (activations.length === 0) {
    console.error("No hay códigos para exportar.");
    process.exit(1);
  }

  const templateKey =
    args.template && TEMPLATES[args.template]
      ? args.template
      : detectTemplate(batchMeta.product_label);

  const outputDir =
    args.output ??
    join(
      root,
      "exports",
      `lote-${(batchMeta.id ?? "csv").slice(0, 8)}-${templateKey}`,
    );

  const qrOnlyDir = join(outputDir, "qr-only");
  const labelsDir = join(outputDir, "labels");
  mkdirSync(qrOnlyDir, { recursive: true });
  mkdirSync(labelsDir, { recursive: true });

  console.log(`\nExportando ${activations.length} QR…`);
  console.log(`  Plantilla: ${templateKey} (${TEMPLATES[templateKey].label})`);
  console.log(`  URL base:  ${args.appUrl}`);
  console.log(`  Salida:    ${outputDir}\n`);

  const manifestItems = [];

  for (let i = 0; i < activations.length; i++) {
    const activation = activations[i];
    const code = activation.activation_code;
    const url = activation.activation_url ?? activationUrl(code, args.appUrl);
    const index = String(i + 1).padStart(3, "0");
    const safeCode = code.replace(/[^A-Za-z0-9]/g, "");
    const baseName = `${index}_${safeCode}`;
    const pngPath = join(qrOnlyDir, `${baseName}.png`);
    const svgPath = join(labelsDir, `${baseName}.svg`);

    const pngBuffer = await qrPngBuffer(url);
    writeFileSync(pngPath, pngBuffer);

    const qrThumb = await QRCode.toBuffer(url, {
      errorCorrectionLevel: "H",
      type: "png",
      width: 512,
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
    });
    const qrDataUri = `data:image/png;base64,${qrThumb.toString("base64")}`;
    const labelSvg = buildLabelSvg({
      templateKey,
      activationCode: code,
      qrDataUri,
    });
    writeFileSync(svgPath, labelSvg, "utf8");

    manifestItems.push({
      index: i + 1,
      activation_code: code,
      activation_url: url,
      status: activation.status ?? "unclaimed",
      filename_png: `qr-only/${baseName}.png`,
      filename_svg: `${baseName}.svg`,
    });

    process.stdout.write(`  ✓ ${baseName}\r`);
  }

  const manifest = {
    exported_at: new Date().toISOString(),
    app_url: args.appUrl,
    batch: batchMeta,
    template: templateKey,
    count: manifestItems.length,
    items: manifestItems,
  };

  writeFileSync(
    join(outputDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );

  writeFileSync(
    join(outputDir, "print-sheet.html"),
    buildPrintSheetHtml({
      batchMeta,
      items: manifestItems,
      templateKey,
    }),
    "utf8",
  );

  console.log(`\n\nListo: ${manifestItems.length} archivos generados.`);
  console.log(`\nPróximos pasos:`);
  console.log(`  1. Abrí ${join(outputDir, "print-sheet.html")} para vista previa`);
  console.log(`  2. Mandá qr-only/*.png o labels/*.svg a la imprenta`);
  console.log(`  3. Cada QR es único → un producto = un código de activación\n`);
}

main().catch((error) => {
  console.error("\nError:", error.message ?? error);
  process.exit(1);
});
