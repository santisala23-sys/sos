import { bearer, otherTutor, personProfile, scan, tutor, tutorPush } from "../fixtures.mjs";

const PNG_1PX =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export default async function chat(ctx) {
  const t = await tutor(ctx);
  const p = await personProfile(ctx);
  const push = await tutorPush(ctx);
  const s = await scan(ctx, p.slug);
  const msgs = `/api/scan-logs/${s.scanLogId}/messages`;

  await ctx.check("Escaneador escribe en el chat y el tutor recibe push «💬 Mensaje» con el texto", async () => {
    const before = await ctx.pushCount(push);
    const res = await s.scanner.post(msgs, { message: "Hola, encontré a Juan en la estación" }, { headers: bearer(s.scanToken) });
    ctx.expectStatus(res, 200);
    const payload = await ctx.waitPush(push, (x) => x.title.includes("Mensaje"), { after: before });
    ctx.expect(payload.body.includes("encontré a Juan"), payload.body);
  }, { severity: "critical" });

  await ctx.check("El tutor ve el mensaje en el chat del escaneo", async () => {
    const res = await t.client.get(msgs);
    ctx.expectStatus(res, 200);
    ctx.expect(res.json.messages.some((m) => m.body?.includes?.("estación") || m.message?.includes?.("estación") || JSON.stringify(m).includes("estación")), "no aparece el mensaje");
  }, { severity: "critical" });

  const scannerSub = ctx.createPushSubscription();
  await ctx.check("El escaneador activa avisos y recibe la respuesta del tutor («Respuesta de la familia»)", async () => {
    const reg = await s.scanner.post("/api/push/scanner-subscribe", { endpoint: scannerSub.endpoint, keys: scannerSub.keys }, { headers: bearer(s.scanToken) });
    ctx.expectStatus(reg, 200, "scanner-subscribe");
    const reply = await t.client.post(msgs, { message: "Gracias, voy para allá" });
    ctx.expectStatus(reply, 200, "respuesta del tutor");
    const payload = await ctx.waitPush(scannerSub, () => true);
    ctx.expect(payload.title === "Respuesta de la familia", payload.title);
    ctx.expect(payload.body === "Gracias, voy para allá", payload.body);
    ctx.expect(payload.url?.includes(`/p/${p.slug}`), `url: ${payload.url}`);
  }, { severity: "critical" });

  await ctx.check("El escaneador lee la respuesta con su token", async () => {
    const res = await s.scanner.get(msgs, { headers: bearer(s.scanToken) });
    ctx.expectStatus(res, 200);
    ctx.expect(JSON.stringify(res.json).includes("voy para allá"), "no ve la respuesta");
  }, { severity: "high" });

  await ctx.check("Foto en el chat: se guarda y el push dice «Envió una foto»", async () => {
    const before = await ctx.pushCount(push);
    const res = await s.scanner.post(msgs, { media: { type: "image", mime: "image/png", data: PNG_1PX } }, { headers: bearer(s.scanToken) });
    ctx.expectStatus(res, 200);
    const payload = await ctx.waitPush(push, (x) => x.title.includes("Mensaje"), { after: before });
    ctx.expect(payload.body === "Envió una foto", payload.body);
  }, { severity: "medium" });

  await ctx.check("Mensaje vacío, demasiado largo o con media inválida se rechaza", async () => {
    ctx.expectStatus(await s.scanner.post(msgs, { message: "  " }, { headers: bearer(s.scanToken) }), 400, "vacío");
    ctx.expectStatus(await s.scanner.post(msgs, { message: "x".repeat(2001) }, { headers: bearer(s.scanToken) }), 400, "2001 caracteres");
    ctx.expectStatus(await s.scanner.post(msgs, { media: { type: "video", data: "AAAA" } }, { headers: bearer(s.scanToken) }), 400, "tipo de media");
  }, { severity: "medium" });

  await ctx.check("Archivo que no es imagen disfrazado de foto se rechaza", async () => {
    const fake = Buffer.from("<html><script>alert(1)</script></html>").toString("base64");
    const res = await s.scanner.post(msgs, { media: { type: "image", mime: "text/html", data: fake } }, { headers: bearer(s.scanToken) });
    if (res.status === 200) {
      ctx.finding({
        severity: "medium",
        title: "El chat acepta media con MIME arbitrario",
        detail: "POST /api/scan-logs/:id/messages con media.type=image y mime=text/html se guarda. Si luego se sirve con ese Content-Type desde el mismo origen es un XSS almacenado. Validar el MIME contra una lista (image/jpeg, image/png, image/webp, audio/webm, audio/mp4) y los bytes mágicos.",
      });
      return { warn: "aceptó mime text/html como imagen" };
    }
    ctx.expectStatus(res, 400);
  }, { severity: "medium" });

  await ctx.check("Token de otro escaneo no da acceso a este chat", async () => {
    const other = await scan(ctx, p.slug);
    const res = await other.scanner.get(msgs, { headers: bearer(other.scanToken) });
    ctx.expectStatus(res, 403);
  }, { severity: "critical" });

  await ctx.check("Otra cuenta (tutor ajeno) no lee el chat", async () => {
    const o = await otherTutor(ctx);
    ctx.expectStatus(await o.client.get(msgs), 403);
    ctx.expectStatus(await o.client.post(msgs, { message: "intruso" }), 403, "escribir");
  }, { severity: "critical" });

  await ctx.check("Acceso al chat solo con slug + id de escaneo (sin token)", async () => {
    const res = await ctx.client().get(`${msgs}?slug=${p.slug}`);
    if (res.status === 200) {
      ctx.finding({
        severity: "low",
        title: "El chat acepta slug + id de escaneo sin token",
        detail:
          "resolveAccess mantiene un camino legado: con el slug del QR (público, está impreso) y el UUID del escaneo se puede leer y escribir el chat sin token. El UUID es difícil de adivinar, pero el token ya cubre el caso; conviene quitar el fallback cuando los clientes viejos hayan expirado (48 h).",
      });
      return { warn: "slug + scanLogId sin token → 200" };
    }
  }, { severity: "low" });
}
