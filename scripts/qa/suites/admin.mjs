import { admin, personProfile, scan, tutor, tutorPush } from "../fixtures.mjs";

const ADMIN_GETS = [
  "/api/admin/stats",
  "/api/admin/users",
  "/api/admin/profiles",
  "/api/admin/scan-logs",
  "/api/admin/api-logs",
  "/api/admin/api-logs?errors=1",
  "/api/admin/security-logs",
  "/api/admin/maintenance",
  "/api/admin/legal-entity",
  "/api/admin/store-products",
  "/api/admin/store-orders",
  "/api/admin/product-batches",
  "/api/admin/print-templates",
];

export default async function adminSuite(ctx) {
  const a = await admin(ctx);
  const t = await tutor(ctx);
  const p = await personProfile(ctx);

  await ctx.check("Un tutor común no entra al panel ni a las APIs de admin", async () => {
    const page = await t.client.get("/admin");
    ctx.expectStatus(page, [307, 308], "/admin");
    ctx.expect(page.location?.includes("/dashboard"), `location=${page.location}`);
    for (const path of ADMIN_GETS) ctx.expectStatus(await t.client.get(path), 403, path);
    ctx.expectStatus(await t.client.post("/api/admin/product-batches", { partner_name: "x", quantity: 1, profile_type: "person" }), 403, "crear lote");
    const me = await t.client.get("/api/admin/me");
    ctx.expect(me.json?.isAdmin === false, JSON.stringify(me.json));
  }, { severity: "critical" });

  await ctx.check("El admin (por ADMIN_EMAILS) entra al panel", async () => {
    ctx.expectStatus(await a.client.get("/admin"), 200);
    const me = await a.client.get("/api/admin/me");
    ctx.expect(me.json?.isAdmin === true, JSON.stringify(me.json));
  }, { severity: "critical" });

  for (const path of ADMIN_GETS) {
    await ctx.check(`Admin: ${path} responde 200`, async () => {
      ctx.expectStatus(await a.client.get(path), 200);
    }, { severity: "medium" });
  }

  await ctx.check("Admin: las estadísticas cuentan usuarios, perfiles y escaneos", async () => {
    const res = await a.client.get("/api/admin/stats");
    const o = res.json.overview ?? {};
    return { note: JSON.stringify(o).slice(0, 250) };
  }, { severity: "low" });

  await ctx.check("Admin: buscar perfiles por texto y filtrar por tipo", async () => {
    const res = await a.client.get(`/api/admin/profiles?q=${encodeURIComponent("Juan QA")}&profile_type=person`);
    ctx.expectStatus(res, 200);
    ctx.expect(res.json.profiles.some((x) => x.id === p.id), "no encontró el perfil");
  }, { severity: "medium" });

  let batchId = null;
  await ctx.check("Admin: crear lote, verlo y exportarlo en CSV, PDF y ZIP", async () => {
    const res = await a.client.post("/api/admin/product-batches", { partner_name: "Export QA", quantity: 3, profile_type: "pet", product_label: "Chapita" });
    ctx.expectStatus(res, 201, "crear");
    batchId = res.json.batch.id;
    ctx.expectStatus(await a.client.get(`/api/admin/product-batches/${batchId}`), 200, "detalle");
    const csv = await a.client.get(`/api/admin/product-batches/${batchId}?format=csv`);
    ctx.expectStatus(csv, 200, "CSV");
    ctx.expect(res.json.activations.every((x) => csv.text.includes(x.activation_code)), "el CSV no trae todos los códigos");
    const pdf = await a.client.get(`/api/admin/product-batches/${batchId}?format=pdf`);
    const zip = await a.client.get(`/api/admin/product-batches/${batchId}?format=zip`);
    ctx.expect(pdf.status === 200 && pdf.buffer?.subarray(0, 4).toString() === "%PDF", `PDF: HTTP ${pdf.status} ${pdf.text?.slice(0, 120) ?? ""}`);
    ctx.expect(zip.status === 200 && zip.buffer?.subarray(0, 2).toString() === "PK", `ZIP: HTTP ${zip.status} ${zip.text?.slice(0, 120) ?? ""}`);
  }, { severity: "high" });

  await ctx.check("Admin: validaciones del lote (sin partner, tipo inválido, tope de 500)", async () => {
    ctx.expectStatus(await a.client.post("/api/admin/product-batches", { quantity: 1, profile_type: "pet" }), 400, "sin partner");
    ctx.expectStatus(await a.client.post("/api/admin/product-batches", { partner_name: "x", quantity: 1, profile_type: "auto" }), 400, "tipo inválido");
    const big = await a.client.post("/api/admin/product-batches", { partner_name: "Tope QA", quantity: 600, profile_type: "object" });
    ctx.expectStatus(big, 201, "600 códigos");
    ctx.expect(big.json.activations.length <= 500, `creó ${big.json.activations.length}`);
  }, { severity: "medium" });

  await ctx.check("Admin: exportar QR de un perfil en PNG y SVG", async () => {
    const png = await a.client.get(`/api/admin/profiles/${p.id}/export?template=minimal&output=png`);
    ctx.expectStatus(png, 200, "PNG");
    ctx.expect(png.buffer?.subarray(1, 4).toString() === "PNG", "no es PNG");
    const svg = await a.client.get(`/api/admin/profiles/${p.id}/export?template=sticker&output=svg`);
    ctx.expectStatus(svg, 200, "SVG");
    ctx.expectStatus(await a.client.get(`/api/admin/profiles/${p.id}/export?template=inventado`), 400, "plantilla inválida");
  }, { severity: "medium" });

  await ctx.check("Admin: plantillas de impresión (crear, vista previa PDF, borrar)", async () => {
    const res = await a.client.post("/api/admin/print-templates", { name: "Plantilla QA", page_width_mm: 30, page_height_mm: 30 });
    ctx.expectStatus(res, 201, "crear");
    const id = res.json.template.id;
    const preview = await a.client.get(`/api/admin/print-templates/${id}?format=preview&code=QATEST01`);
    ctx.expect(preview.status === 200 && preview.buffer?.subarray(0, 4).toString() === "%PDF", `preview: HTTP ${preview.status}`);
    ctx.expectStatus(await a.client.post("/api/admin/print-templates", { name: "Mal", page_width_mm: 1 }), 400, "medida inválida");
    ctx.expectStatus(await a.client.del(`/api/admin/print-templates/${id}`), 200, "borrar");
  }, { severity: "low" });

  await ctx.check("Admin: productos de la tienda (crear, editar, borrar)", async () => {
    const res = await a.client.post("/api/admin/store-products", { name: "Producto QA", product_type: "otro", price_pesos: "9999", is_active: false });
    ctx.expectStatus(res, 201, "crear");
    const id = res.json.product.id;
    ctx.expectStatus(await a.client.patch(`/api/admin/store-products/${id}`, { discount_percent: 10 }), 200, "editar");
    ctx.expectStatus(await a.client.post("/api/admin/store-products", { product_type: "otro" }), 400, "sin nombre");
    ctx.expectStatus(await a.client.del(`/api/admin/store-products/${id}`), 200, "borrar");
  }, { severity: "medium" });

  await ctx.check("Admin: reenviar la alerta de un escaneo le llega al tutor", async () => {
    const push = await tutorPush(ctx);
    const s = await scan(ctx, p.slug);
    const before = await ctx.pushCount(push);
    const res = await a.client.post(`/api/admin/scan-logs/${s.scanLogId}/resend-alert`, {});
    ctx.expectStatus(res, 200);
    const payload = await ctx.waitPush(push, () => true, { after: before });
    return { note: `«${payload.title}» — «${payload.body}»` };
  }, { severity: "medium" });

  await ctx.check("Admin: detalle de escaneo y marcar leído", async () => {
    const logs = await a.client.get("/api/admin/scan-logs?limit=5");
    const id = logs.json.logs[0]?.id;
    ctx.expectStatus(await a.client.get(`/api/admin/scan-logs/${id}`), 200, "detalle");
    ctx.expectStatus(await a.client.patch(`/api/admin/scan-logs/${id}`, { read: true }), 200, "marcar");
    ctx.expectStatus(await a.client.patch(`/api/admin/scan-logs/${id}`, {}), 400, "sin read");
  }, { severity: "low" });

  await ctx.check("Admin: datos legales de la empresa", async () => {
    const res = await a.client.patch("/api/admin/legal-entity", { legal_name: "SOSme QA SRL", cuit: "30-00000000-0", privacy_email: "privacidad@qa.test" });
    ctx.expectStatus(res, 200);
    const page = await ctx.client().get("/privacidad");
    return { note: page.text.includes("SOSme QA SRL") ? "la política de privacidad toma la razón social cargada" : "la política no muestra la razón social cargada" };
  }, { severity: "low" });

  await ctx.check("Admin: los errores 5xx quedan registrados en api-logs", async () => {
    const res = await a.client.get("/api/admin/api-logs?errors=1&limit=200");
    const errors = (res.json.logs ?? []).filter((l) => l.status_code >= 500);
    if (errors.length) {
      return { warn: `${errors.length} respuestas 5xx durante el QA: ${[...new Set(errors.map((e) => `${e.method} ${e.path} → ${e.error_message ?? e.status_code}`))].slice(0, 6).join(" | ")}` };
    }
    return { note: "sin 5xx registrados" };
  }, { severity: "medium" });
}
