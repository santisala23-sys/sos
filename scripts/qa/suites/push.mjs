import { otherTutor, personProfile, registerPush, tutor } from "../fixtures.mjs";

export default async function pushSuite(ctx) {
  const t = await tutor(ctx);
  const o = await otherTutor(ctx);
  const p = await personProfile(ctx);

  await ctx.check("Push sin sesión o con suscripción incompleta se rechaza", async () => {
    const sub = ctx.createPushSubscription();
    ctx.expectStatus(await ctx.client().post("/api/push/subscribe", { endpoint: sub.endpoint, keys: sub.keys }), 401, "sin sesión");
    ctx.expectStatus(await t.client.post("/api/push/subscribe", { endpoint: sub.endpoint }), 400, "sin claves");
  }, { severity: "high" });

  const second = await registerPush(ctx, t);
  await ctx.check("Un segundo dispositivo del tutor queda registrado y listado", async () => {
    ctx.expectStatus(second.res, 200);
    ctx.expect(second.res.json?.testDelivered === true, JSON.stringify(second.res.json));
    const list = await t.client.get("/api/push/subscribe");
    ctx.expectStatus(list, 200);
    ctx.expect(list.json.devices.length >= 2, `dispositivos: ${list.json.devices.length}`);
    return { note: `etiqueta: ${list.json.devices.map((d) => d.label ?? d.deviceLabel ?? "?").join(", ")}` };
  }, { severity: "high" });

  await ctx.check("Una alerta SOS llega a todos los dispositivos del tutor", async () => {
    const before = await ctx.pushCount(second.sub);
    ctx.expectStatus(await ctx.client().post("/api/alerts/sos", { slug: p.slug }), 200);
    await ctx.waitPush(second.sub, (x) => x.title.includes("SOS"), { after: before });
  }, { severity: "critical" });

  await ctx.check("«Probar notificación» manda un push al dispositivo", async () => {
    const before = await ctx.pushCount(second.sub);
    const res = await t.client.post("/api/push/test", { endpoint: second.sub.endpoint });
    ctx.expectStatus(res, 200);
    await ctx.waitPush(second.sub, () => true, { after: before });
  }, { severity: "medium" });

  await ctx.check("Otra cuenta no puede adueñarse del mismo dispositivo (409)", async () => {
    const res = await o.client.post("/api/push/subscribe", { endpoint: second.sub.endpoint, keys: second.sub.keys });
    ctx.expectStatus(res, 409);
  }, { severity: "high" });

  await ctx.check("Otra cuenta no puede borrar un dispositivo ajeno por id", async () => {
    const list = await t.client.get("/api/push/subscribe");
    const device = list.json.devices[0];
    ctx.expect(device?.id, "sin id de dispositivo");
    ctx.expectStatus(await o.client.del("/api/push/subscribe", { id: device.id }), [403, 404]);
  }, { severity: "high" });

  await ctx.check("Desactivar un dispositivo deja de mandarle alertas", async () => {
    ctx.expectStatus(await t.client.del("/api/push/subscribe", { endpoint: second.sub.endpoint }), 200);
    const before = await ctx.pushCount(second.sub);
    await ctx.client().post("/api/alerts/sos", { slug: p.slug });
    const extra = await ctx.noPush(second.sub, { after: before });
    ctx.expect(extra.length === 0, `siguió recibiendo ${extra.length} push`);
  }, { severity: "high" });

  await ctx.check("Una suscripción vencida (410) se borra sola al mandar una alerta", async () => {
    const gone = await registerPush(ctx, t, { gone: true });
    ctx.expectStatus(gone.res, 200, "registrar");
    await ctx.client().post("/api/alerts/sos", { slug: p.slug });
    await ctx.sleep(1500);
    const rows = await ctx.sql("SELECT count(*)::int AS n FROM push_subscriptions WHERE endpoint = $1", [gone.sub.endpoint]);
    ctx.expect(rows[0].n === 0, "la suscripción vencida sigue en la base");
  }, { severity: "medium" });

  await ctx.check("El endpoint push acepta cualquier host https", async () => {
    const sub = ctx.createPushSubscription();
    // .invalid nunca resuelve: prueba que se guarda sin generar tráfico real.
    const res = await o.client.post("/api/push/subscribe", { endpoint: "https://intranet.invalid/admin", keys: sub.keys });
    if (res.status === 200) {
      ctx.finding({
        severity: "low",
        title: "Suscripción push sin lista de hosts permitidos",
        detail:
          "POST /api/push/subscribe guarda cualquier URL https y el servidor le hace un POST (push de prueba y alertas). Es un SSRF acotado. Conviene aceptar solo servicios push conocidos (fcm.googleapis.com, updates.push.services.mozilla.com, *.notify.windows.com, web.push.apple.com).",
      });
      return { warn: "aceptó un endpoint a un host arbitrario" };
    }
  }, { severity: "low" });
}
