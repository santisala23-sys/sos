import { bearer, otherTutor, personProfile, scan, tutor, tutorPush } from "../fixtures.mjs";

const GEO_HEADERS = {
  "x-vercel-ip-latitude": "-34.6037",
  "x-vercel-ip-longitude": "-58.3816",
  "x-vercel-ip-city": "Buenos%20Aires",
  "x-vercel-ip-country": "AR",
};

async function findLog(ctx, client, id) {
  const res = await client.get("/api/scan-logs");
  ctx.expectStatus(res, 200, "/api/scan-logs");
  return { log: res.json.logs.find((l) => l.id === id), unread: res.json.unreadCount, all: res.json.logs };
}

export default async function scanSuite(ctx) {
  const t = await tutor(ctx);
  const p = await personProfile(ctx);
  const push = await tutorPush(ctx);

  await ctx.check("Al activar alertas, el tutor recibe el push de prueba", async () => {
    const payload = await ctx.waitPush(push, (x) => /Alertas activas/.test(x.title));
    if (/cuando escaneen tu QR/i.test(payload.body)) {
      ctx.finding({
        severity: "low",
        title: "El push de prueba promete avisos por cada escaneo",
        detail: `Dice «${payload.body}», pero desde el cambio de producto un escaneo solo no avisa: el push llega con ubicación exacta, SOS, mensaje o visita veterinaria. Ajustar el texto en src/app/api/push/subscribe/route.ts.`,
      });
      return { warn: `texto desactualizado: «${payload.body}»` };
    }
  }, { severity: "high" });

  let first = {};
  await ctx.check("Escanear el QR registra el escaneo y entrega token de sesión al escaneador", async () => {
    first = await scan(ctx, p.slug);
    ctx.expectStatus(first.res, 200);
    ctx.expect(first.scanLogId && first.scanToken, JSON.stringify(first.res.json));
  }, { severity: "critical" });

  await ctx.check("Un escaneo sin ubicación exacta NO manda push al tutor", async () => {
    const before = await ctx.pushCount(push);
    await scan(ctx, p.slug);
    const extra = await ctx.noPush(push, { after: before });
    ctx.expect(extra.length === 0, `llegaron ${extra.length} push: ${extra.map((x) => x.payload.title).join(" | ")}`);
  }, { severity: "high" });

  await ctx.check("El escaneo aparece en Actividad del tutor como no leído", async () => {
    const { log, unread } = await findLog(ctx, t.client, first.scanLogId);
    ctx.expect(log, "el escaneo no aparece en /api/scan-logs");
    ctx.expect(log.alert_type === "scan", `alert_type=${log.alert_type}`);
    ctx.expect(!log.read_at, "ya figura como leído");
    ctx.expect(unread >= 1, `unreadCount=${unread}`);
  }, { severity: "critical" });

  await ctx.check("Escaneo con geolocalización por IP queda como ubicación aproximada", async () => {
    const s = await scan(ctx, p.slug, { headers: GEO_HEADERS });
    ctx.expectStatus(s.res, 200);
    const { log } = await findLog(ctx, t.client, s.scanLogId);
    ctx.expect(log?.location_is_approximate === true, `location_is_approximate=${log?.location_is_approximate}`);
    ctx.expect(Number(log.latitude) === -34.6037, `latitude=${log.latitude}`);
  }, { severity: "high" });

  await ctx.check("El escaneador puede retomar su sesión (resume) con el token", async () => {
    const res = await ctx.client().get(`/api/scan-logs/resume?scanToken=${encodeURIComponent(first.scanToken)}`);
    ctx.expectStatus(res, 200);
    ctx.expect(res.json?.valid === true && res.json.scanLogId === first.scanLogId, JSON.stringify(res.json));
    const bad = await ctx.client().get(`/api/scan-logs/resume?scanToken=basura`);
    ctx.expect(bad.json?.valid === false || bad.status === 403, `token basura → ${bad.status} ${bad.text}`);
  }, { severity: "high" });

  await ctx.check("Compartir ubicación exige token válido", async () => {
    const c = ctx.client();
    ctx.expectStatus(await c.patch("/api/alerts/location", { latitude: -34.6, longitude: -58.4 }), 401, "sin token");
    ctx.expectStatus(await c.patch("/api/alerts/location", { latitude: -34.6, longitude: -58.4 }, { headers: bearer("x.y.z") }), 403, "token falso");
  }, { severity: "critical" });

  await ctx.check("Compartir ubicación exacta: guarda GPS y avisa al tutor con push «📍 Ubicación»", async () => {
    const before = await ctx.pushCount(push);
    const res = await first.scanner.patch(
      "/api/alerts/location",
      { latitude: -34.5875, longitude: -58.4205 },
      { headers: bearer(first.scanToken) },
    );
    ctx.expectStatus(res, 200);
    const payload = await ctx.waitPush(push, (x) => x.title.includes("Ubicación"), { after: before });
    ctx.expect(payload.title === `📍 Ubicación — ${p.profile.beneficiary_name}`, `título: ${payload.title}`);
    ctx.expect(/ubicación exacta/i.test(payload.body), `cuerpo: ${payload.body}`);
    ctx.expect(payload.url?.endsWith(`/dashboard/logs/${first.scanLogId}`), `url: ${payload.url}`);
    const { log } = await findLog(ctx, t.client, first.scanLogId);
    ctx.expect(Number(log.latitude) === -34.5875 && log.location_is_approximate === false, JSON.stringify(log));
    return { note: `«${payload.title}» — «${payload.body}»` };
  }, { severity: "critical" });

  await ctx.check("Coordenadas inválidas en ubicación se rechazan con 400", async () => {
    const s = await scan(ctx, p.slug);
    const res = await s.scanner.patch("/api/alerts/location", { latitude: 999, longitude: "abc" }, { headers: bearer(s.scanToken) });
    const numeric = await s.scanner.patch("/api/alerts/location", { latitude: 999, longitude: 10 }, { headers: bearer(s.scanToken) });
    if (res.status !== 400 || numeric.status !== 400) {
      ctx.finding({
        severity: "low",
        title: "Ubicación del escaneador sin validar",
        detail: `PATCH /api/alerts/location solo chequea que lat/lng no sean null. Con longitude "abc" responde ${res.status} (la base rechaza el valor y sale «Error interno»); con latitude 999 responde ${numeric.status} y ${numeric.status === 200 ? "guarda la coordenada imposible y le manda el push al tutor" : "falla"}. Validar números finitos en -90..90 / -180..180 como hace saved-locations; lo mismo en POST /api/alerts/sos.`,
      });
    }
    ctx.expectStatus(res, 400, "longitude no numérica");
    ctx.expectStatus(numeric, 400, "latitude 999");
  }, { severity: "low" });

  await ctx.check("Botón SOS crea alerta SOS y manda push «🆘 SOS» al tutor", async () => {
    const before = await ctx.pushCount(push);
    const res = await ctx.client().post("/api/alerts/sos", { slug: p.slug, userAgent: "QA", latitude: -34.6, longitude: -58.38 });
    ctx.expectStatus(res, 200);
    const payload = await ctx.waitPush(push, (x) => x.title.includes("SOS"), { after: before });
    ctx.expect(payload.title === `🆘 SOS — ${p.profile.beneficiary_name}`, payload.title);
    const { log } = await findLog(ctx, t.client, res.json.scanLogId);
    ctx.expect(log?.alert_type === "sos", `alert_type=${log?.alert_type}`);
    return { note: `«${payload.title}» — «${payload.body}»` };
  }, { severity: "critical" });

  await ctx.check("Nota del escaneador (alerts/note) llega al tutor como mensaje", async () => {
    const before = await ctx.pushCount(push);
    const res = await ctx.client().patch("/api/alerts/note", { scanLogId: first.scanLogId, slug: p.slug, note: "Lo encontré en la plaza" });
    ctx.expectStatus(res, 200);
    const payload = await ctx.waitPush(push, (x) => x.title.includes("Mensaje"), { after: before });
    ctx.expect(payload.body === "Lo encontré en la plaza", payload.body);
    ctx.expectStatus(await ctx.client().patch("/api/alerts/note", { scanLogId: first.scanLogId, slug: "otro-slug", note: "x" }), 404, "slug que no corresponde");
  }, { severity: "high" });

  await ctx.check("Contacto: /api/contact devuelve enlaces de llamada/WhatsApp del perfil", async () => {
    const res = await ctx.client().post("/api/contact", { slug: p.slug, alertType: "scan", scanLogId: first.scanLogId });
    ctx.expectStatus(res, 200);
    const text = JSON.stringify(res.json);
    ctx.expect(text.includes("5491123456789"), `no trae el teléfono: ${text.slice(0, 200)}`);
  }, { severity: "critical" });

  await ctx.check("Detalle del escaneo: página y API para el tutor; otra cuenta no lo ve", async () => {
    ctx.expectStatus(await t.client.get(`/dashboard/logs/${first.scanLogId}`), 200, "página");
    ctx.expectStatus(await t.client.get(`/api/scan-logs/${first.scanLogId}`), 200, "API");
    const o = await otherTutor(ctx);
    ctx.expectStatus(await o.client.get(`/api/scan-logs/${first.scanLogId}`), [403, 404], "API otra cuenta");
    ctx.expectStatus(await o.client.patch(`/api/scan-logs/${first.scanLogId}`, {}), [403, 404], "marcar leído otra cuenta");
  }, { severity: "critical" });

  await ctx.check("Marcar como leído y «marcar todo» bajan el contador", async () => {
    ctx.expectStatus(await t.client.patch(`/api/scan-logs/${first.scanLogId}`, {}), 200, "marcar uno");
    const { log } = await findLog(ctx, t.client, first.scanLogId);
    ctx.expect(log?.read_at, "no quedó leído");
    ctx.expectStatus(await t.client.post("/api/scan-logs/mark-all-read", {}), 200, "marcar todo");
    const after = await findLog(ctx, t.client, first.scanLogId);
    ctx.expect(after.unread === 0, `unreadCount=${after.unread}`);
  }, { severity: "high" });

  await ctx.check("Escanear slug inexistente devuelve 404 sin crear registros", async () => {
    ctx.expectStatus(await ctx.client().post("/api/alerts/scan", { slug: "no-existe" }), 404);
    ctx.expectStatus(await ctx.client().post("/api/alerts/scan", {}), 400, "sin slug");
  }, { severity: "medium" });

  await ctx.check("Límite de escaneos por IP (alertas: 20 por hora)", async () => {
    const c = ctx.client();
    const statuses = [];
    for (let i = 0; i < 24; i++) statuses.push((await c.post("/api/alerts/scan", { slug: p.slug })).status);
    ctx.expect(statuses.includes(429), `sin 429: ${statuses.join(",")}`);
    return { note: `primer 429 en el escaneo ${statuses.indexOf(429) + 1}` };
  }, { severity: "high" });

  await ctx.check("Página pública /p/:slug abre (lo que ve quien escanea)", async () => {
    const res = await ctx.client().get(`/p/${p.slug}`);
    ctx.expectStatus(res, 200);
    ctx.expect(res.text.includes(p.profile.beneficiary_name), "no muestra el nombre");
  }, { severity: "critical" });
}
