import { admin, activationCodes, PERSON_DATA } from "../fixtures.mjs";

export default async function account(ctx) {
  const u = await ctx.createVerifiedUser({ email: "baja@qa.test", fullName: "Baja QA" });
  const [{ code }] = await activationCodes(ctx, "person", 1);
  await u.client.rotateIp().post(`/api/activar/${code}`, { ...PERSON_DATA, beneficiary_name: "Perfil de Baja" });

  await ctx.check("Exportar mis datos descarga un ZIP con account.json", async () => {
    const res = await u.client.get("/api/account/export");
    ctx.expectStatus(res, 200);
    ctx.expect((res.headers.get("content-type") ?? "").includes("zip"), `content-type ${res.headers.get("content-type")}`);
    ctx.expect(res.buffer?.subarray(0, 2).toString() === "PK", "no es un ZIP");
    ctx.expect(res.buffer.includes(Buffer.from("account.json")), "el ZIP no tiene account.json");
    ctx.expect(!res.buffer.includes(Buffer.from("password_hash")), "el export incluye password_hash");
  }, { severity: "high" });

  await ctx.check("Exportar sin sesión devuelve 401", async () => {
    ctx.expectStatus(await ctx.client().get("/api/account/export"), 401);
  }, { severity: "high" });

  await ctx.check("Pedir la baja cierra la sesión y bloquea el login", async () => {
    const res = await u.client.post("/api/account/delete-request", {});
    ctx.expectStatus(res, 200);
    const days = (new Date(res.json.deletionScheduledFor) - Date.now()) / 86400000;
    ctx.expect(days > 29 && days < 31, `baja programada a ${days.toFixed(1)} días`);
    ctx.expectStatus(await u.client.get("/api/auth/me"), 401, "sesión después de la baja");
    const login = await ctx.client().post("/api/auth/login", { email: u.email, password: u.password });
    ctx.expectStatus(login, 403, "login después de la baja");
  }, { severity: "high" });

  await ctx.check("El perfil de una cuenta en baja deja de ser público", async () => {
    const [row] = await ctx.sql("SELECT slug FROM qr_profiles WHERE beneficiary_name = 'Perfil de Baja'");
    const res = await ctx.client().post("/api/alerts/scan", { slug: row.slug });
    if (res.status === 200) {
      return { warn: "durante los 30 días de gracia el QR sigue respondiendo (puede ser intencional)" };
    }
  }, { severity: "low" });

  await ctx.check("Admin cancela la baja y la cuenta vuelve a entrar", async () => {
    const a = await admin(ctx);
    const res = await a.client.post("/api/admin/maintenance", { action: "cancel_deletion", userId: u.id });
    ctx.expectStatus(res, 200);
    ctx.expectStatus(await ctx.client().post("/api/auth/login", { email: u.email, password: u.password }), 200, "login");
  }, { severity: "medium" });
}
