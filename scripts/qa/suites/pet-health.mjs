import { otherTutor, petProfile, tutor, tutorPush } from "../fixtures.mjs";

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export default async function petHealth(ctx) {
  const t = await tutor(ctx);
  const o = await otherTutor(ctx);
  const pet = await petProfile(ctx);
  const push = await tutorPush(ctx);
  const base = `/api/qr-profiles/${pet.id}`;

  await ctx.check("Libreta sanitaria abre para el dueño", async () => {
    ctx.expectStatus(await t.client.get(`/dashboard/perfiles/${pet.id}/libreta`), 200, "página");
    const res = await t.client.get(`${base}/medical-records`);
    ctx.expectStatus(res, 200, "API");
    ctx.expect(Array.isArray(res.json.visits), JSON.stringify(res.json).slice(0, 200));
  }, { severity: "high" });

  await ctx.check("Raza y fecha de nacimiento se editan; fecha futura se rechaza", async () => {
    ctx.expectStatus(await t.client.patch(base, { pet_breed: "Caniche", pet_birth_date: "2019-03-01" }), 200, "editar");
    ctx.expectStatus(await t.client.patch(base, { pet_birth_date: inDays(30) }), 400, "fecha futura");
  }, { severity: "medium" });

  await ctx.check("Peso: alta válida y rechazo de 0 kg y 500 kg", async () => {
    ctx.expectStatus(await t.client.post(`${base}/weight-entries`, { weight_kg: 12.5, notes: "control QA" }), 201, "12.5 kg");
    ctx.expectStatus(await t.client.post(`${base}/weight-entries`, { weight_kg: 0 }), 400, "0 kg");
    ctx.expectStatus(await t.client.post(`${base}/weight-entries`, { weight_kg: 500 }), 400, "500 kg");
    const list = await t.client.get(`${base}/weight-entries`);
    ctx.expect(list.json.entries.some((e) => Number(e.weight_kg) === 12.5), "no aparece el peso");
  }, { severity: "medium" });

  await ctx.check("Visita cargada por el tutor se guarda; datos inválidos se rechazan", async () => {
    ctx.expectStatus(await t.client.post(`${base}/medical-records`, { visit_date: today(), summary: "Control anual QA", tags: ["control"] }), 201, "visita");
    ctx.expectStatus(await t.client.post(`${base}/medical-records`, { visit_date: "03/11/2026", summary: "Control" }), 400, "fecha mal formada");
    ctx.expectStatus(await t.client.post(`${base}/medical-records`, { visit_date: today(), summary: "x" }), 400, "resumen corto");
  }, { severity: "high" });

  let itemId = null;
  await ctx.check("Vacunas y desparasitaciones: alta, edición y baja", async () => {
    const created = await t.client.post(`${base}/preventive`, { kind: "vaccine", name: "Antirrábica QA", last_applied_at: today(), next_due_at: inDays(1) });
    ctx.expectStatus(created, 201, "alta");
    itemId = created.json.item.id;
    ctx.expectStatus(await t.client.post(`${base}/preventive`, { kind: "otra", name: "x" }), 400, "tipo inválido");
    ctx.expectStatus(await t.client.patch(`${base}/preventive/${itemId}`, { name: "Antirrábica QA (refuerzo)" }), 200, "edición");
  }, { severity: "high" });

  await ctx.check("Otra cuenta no accede a la libreta ajena", async () => {
    ctx.expectStatus(await o.client.get(`${base}/medical-records`), [403, 404], "leer visitas");
    ctx.expectStatus(await o.client.post(`${base}/weight-entries`, { weight_kg: 5 }), [403, 404], "cargar peso");
    ctx.expectStatus(await o.client.post(`${base}/preventive`, { kind: "vaccine", name: "x" }), [403, 404], "cargar vacuna");
    ctx.expectStatus(await o.client.post(`${base}/vet-token`, {}), [403, 404], "generar QR vet");
  }, { severity: "critical" });

  let vet = null;
  await ctx.check("QR para veterinario: genera un enlace de 24 h", async () => {
    const res = await t.client.post(`${base}/vet-token`, {});
    ctx.expectStatus(res, 200);
    vet = res.json;
    const hours = (new Date(vet.expires_at) - Date.now()) / 3600000;
    ctx.expect(hours > 23 && hours <= 24.1, `vence en ${hours.toFixed(1)} h`);
    ctx.expectStatus(await ctx.client().get(`/vet-view/${vet.token}`), 200, "página vet");
    ctx.expectStatus(await ctx.client().get(`/api/vet-view/${vet.token}`), 200, "API vet");
  }, { severity: "critical" });

  await ctx.check("El veterinario debe identificarse con nombre y matrícula", async () => {
    ctx.expectStatus(await ctx.client().post(`/api/vet-view/${vet.token}/records`, { visit_date: today(), summary: "Consulta" }), 400);
  }, { severity: "high" });

  await ctx.check("Visita cargada por el veterinario avisa al tutor por push", async () => {
    const before = await ctx.pushCount(push);
    const res = await ctx.client().post(`/api/vet-view/${vet.token}/records`, {
      visit_date: today(), summary: "Vacunación y control QA", vet_name: "Dra. QA", vet_license: "MP 1234", weight_kg: 13,
    });
    ctx.expectStatus(res, 201);
    const payload = await ctx.waitPush(push, (x) => /visita|veterin/i.test(x.title + x.body), { after: before });
    return { note: `«${payload.title}» — «${payload.body}»` };
  }, { severity: "high" });

  await ctx.check("Adjunto HTML subido por el veterinario no se sirve como página", async () => {
    const html = Buffer.from("<html><body><script>document.title='xss-qa'</script></body></html>").toString("base64");
    const res = await ctx.client().post(`/api/vet-view/${vet.token}/records`, {
      visit_date: today(), summary: "Adjunto QA", vet_name: "Dra. QA", vet_license: "MP 1234",
      attachments: [{ filename: "informe.html", mime: "text/html", data: html }],
    });
    if (res.status !== 201) return { note: `rechazado con ${res.status}` };
    const list = await t.client.get(`${base}/medical-records`);
    const visit = list.json.visits.find((v) => v.summary === "Adjunto QA");
    const att = visit?.attachments?.[0];
    ctx.expect(att?.id, `no encuentro el adjunto en la visita: ${JSON.stringify(visit).slice(0, 200)}`);
    const file = await t.client.get(`${base}/visit-attachments/${att.id}`);
    const type = file.headers.get("content-type") ?? "";
    const disposition = file.headers.get("content-disposition") ?? "";
    const csp = file.headers.get("content-security-policy") ?? "";
    const rendersInline = type.includes("text/html") && !disposition.includes("attachment");
    if (rendersInline) {
      ctx.finding({
        severity: "high",
        title: "XSS almacenado vía adjunto de visita veterinaria",
        detail: `Quien tenga el link de veterinario (24 h, sin cuenta) puede subir un adjunto text/html. El tutor lo abre desde ${base}/visit-attachments/:id y se sirve como ${type} inline desde sosme.com.ar${csp ? ` (CSP: ${csp.slice(0, 80)}…)` : " sin CSP"}. Validar MIME (pdf/jpg/png/webp), forzar Content-Disposition: attachment y X-Content-Type-Options: nosniff en las rutas de adjuntos.`,
      });
      ctx.expect(false, `se sirve como ${type} inline`);
    }
    return { note: `Content-Type ${type}; Content-Disposition ${disposition || "(ninguno)"}` };
  }, { severity: "high" });

  await ctx.check("Adjunto PNG del veterinario: el tutor lo descarga y otra cuenta no", async () => {
    const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const res = await ctx.client().post(`/api/vet-view/${vet.token}/records`, {
      visit_date: today(), summary: "Radiografía QA", vet_name: "Dra. QA", vet_license: "MP 1234",
      attachments: [{ filename: "placa.png", mime: "image/png", data: png }],
    });
    ctx.expectStatus(res, 201, "subir");
    const list = await t.client.get(`${base}/medical-records`);
    const att = list.json.visits.find((v) => v.summary === "Radiografía QA")?.attachments?.[0];
    ctx.expect(att?.id, "no encuentro el adjunto");
    const file = await t.client.get(`${base}/visit-attachments/${att.id}`);
    ctx.expectStatus(file, 200, "descargar");
    ctx.expect((file.headers.get("content-type") ?? "").startsWith("image/png"), `content-type ${file.headers.get("content-type")}`);
    ctx.expectStatus(await o.client.get(`${base}/visit-attachments/${att.id}`), [403, 404], "otra cuenta");
    ctx.expectStatus(await ctx.client().get(`/api/vet-view/${vet.token}/attachments/${att.id}`), 200, "el vet lo ve con su enlace");
  }, { severity: "high" });

  await ctx.check("Veterinario puede cargar vacunas con el mismo enlace", async () => {
    const res = await ctx.client().post(`/api/vet-view/${vet.token}/preventive`, { kind: "deworming", name: "Antiparasitario QA", last_applied_at: today() });
    ctx.expectStatus(res, [200, 201]);
  }, { severity: "medium" });

  await ctx.check("Enlace de veterinario vencido o inventado no funciona", async () => {
    ctx.expectStatus(await ctx.client().get(`/api/vet-view/00000000-0000-4000-8000-000000000000`), 404, "token inventado");
    await ctx.sql("UPDATE vet_access_tokens SET expires_at = NOW() - interval '1 minute' WHERE token::text = $1", [vet.token]);
    ctx.expectStatus(await ctx.client().get(`/api/vet-view/${vet.token}`), 404, "token vencido");
    ctx.expectStatus(await ctx.client().post(`/api/vet-view/${vet.token}/records`, { visit_date: today(), summary: "Tarde", vet_name: "Dra. QA", vet_license: "MP 1" }), [403, 404, 410], "cargar con token vencido");
  }, { severity: "critical" });

  await ctx.check("El PDF clínico viejo responde 410 (retirado)", async () => {
    ctx.expectStatus(await t.client.get(`${base}/clinical-pdf`), 410);
  }, { severity: "low" });

  await ctx.check("Borrar un ítem preventivo", async () => {
    ctx.expectStatus(await t.client.del(`${base}/preventive/${itemId}`), 200);
  }, { severity: "low" });
}
