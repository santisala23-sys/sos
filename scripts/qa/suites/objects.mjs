import { objectProfile, otherTutor, scan, tutor, tutorPush, bearer } from "../fixtures.mjs";

export default async function objects(ctx) {
  const t = await tutor(ctx);
  const o = await otherTutor(ctx);
  const obj = await objectProfile(ctx);
  const push = await tutorPush(ctx);

  await ctx.check("Perfil de objeto: página pública abre", async () => {
    const res = await ctx.client().get(`/p/${obj.slug}`);
    ctx.expectStatus(res, 200);
    ctx.expect(res.text.includes("Casco QA"), "no muestra el nombre del objeto");
  }, { severity: "high" });

  await ctx.check("Quien encuentra el objeto guarda la ubicación sin cuenta", async () => {
    const res = await ctx.client().post(`/api/p/${obj.slug}/saved-location`, { latitude: -34.61, longitude: -58.37 });
    ctx.expectStatus(res, 200);
    ctx.expect(res.json?.saved_location_at, JSON.stringify(res.json));
  }, { severity: "high" });

  await ctx.check("Coordenadas fuera de rango en ubicación del objeto se rechazan", async () => {
    ctx.expectStatus(await ctx.client().post(`/api/p/${obj.slug}/saved-location`, { latitude: 120, longitude: 10 }), 400);
  }, { severity: "low" });

  await ctx.check("El dueño ve el historial de ubicaciones; otra cuenta no", async () => {
    const res = await t.client.get(`/api/qr-profiles/${obj.id}/saved-locations`);
    ctx.expectStatus(res, 200);
    ctx.expect(res.json.locations.length >= 1, "historial vacío");
    ctx.expectStatus(await o.client.get(`/api/qr-profiles/${obj.id}/saved-locations`), [403, 404], "otra cuenta");
  }, { severity: "high" });

  await ctx.check("El dueño también puede guardar ubicación desde el panel", async () => {
    ctx.expectStatus(await t.client.post(`/api/qr-profiles/${obj.id}/saved-locations`, { latitude: -34.62, longitude: -58.36 }), 200);
  }, { severity: "medium" });

  await ctx.check("Escanear un objeto + ubicación exacta avisa al dueño", async () => {
    const s = await scan(ctx, obj.slug);
    ctx.expectStatus(s.res, 200, "escaneo");
    const before = await ctx.pushCount(push);
    ctx.expectStatus(await s.scanner.patch("/api/alerts/location", { latitude: -34.6, longitude: -58.4 }, { headers: bearer(s.scanToken) }), 200, "ubicación");
    await ctx.waitPush(push, (x) => x.title.includes("Casco QA"), { after: before });
  }, { severity: "high" });

  await ctx.check("Guardar ubicación en un perfil de persona no aplica", async () => {
    const { personProfile } = await import("../fixtures.mjs");
    const p = await personProfile(ctx);
    ctx.expectStatus(await ctx.client().post(`/api/p/${p.slug}/saved-location`, { latitude: -34.6, longitude: -58.4 }), [400, 403, 404]);
  }, { severity: "low" });
}
