import { petProfile, tutor, tutorPush } from "../fixtures.mjs";

const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export default async function cron(ctx) {
  const t = await tutor(ctx);
  const pet = await petProfile(ctx);
  const push = await tutorPush(ctx);
  const secret = ctx.env.CRON_SECRET;

  await ctx.check("Los cron rechazan llamadas sin secreto", async () => {
    ctx.expectStatus(await ctx.client().get("/api/cron/purge"), [401, 403], "purge");
    ctx.expectStatus(await ctx.client().get("/api/cron/preventive-reminders"), [401, 403], "reminders");
    ctx.expectStatus(await ctx.client().get("/api/cron/purge", { headers: { authorization: "Bearer otro" } }), [401, 403], "secreto incorrecto");
  }, { severity: "critical" });

  await ctx.check("Recordatorio de vacuna: el cron manda push «Próxima vacuna … mañana»", async () => {
    const created = await t.client.post(`/api/qr-profiles/${pet.id}/preventive`, {
      kind: "vaccine", name: "Séxtuple QA", last_applied_at: inDays(-364), next_due_at: inDays(1),
    });
    ctx.expectStatus(created, 201, "crear vacuna");
    const before = await ctx.pushCount(push);
    const res = await ctx.client().get("/api/cron/preventive-reminders", { headers: { authorization: `Bearer ${secret}` } });
    ctx.expectStatus(res, 200, "cron");
    const payload = await ctx.waitPush(push, (x) => x.body.includes("Séxtuple QA"), { after: before });
    ctx.expect(/mañana/.test(payload.body), payload.body);
    const again = await ctx.client().get("/api/cron/preventive-reminders", { headers: { "x-cron-secret": secret } });
    ctx.expectStatus(again, 200, "segunda corrida");
    const extra = await ctx.noPush(push, { after: before + 1, waitMs: 1500 });
    ctx.expect(extra.filter((x) => x.payload.body.includes("Séxtuple QA")).length === 0, "el recordatorio se repitió en la misma ventana");
    return { note: `«${payload.title}» — «${payload.body}»` };
  }, { severity: "high" });

  await ctx.check("Purga de retención corre con el secreto", async () => {
    const res = await ctx.client().get("/api/cron/purge", { headers: { authorization: `Bearer ${secret}` } });
    ctx.expectStatus(res, 200);
    return { note: JSON.stringify(res.json.purged ?? res.json).slice(0, 200) };
  }, { severity: "high" });

  await ctx.check("vercel.json agenda los cron", async () => {
    const { readFileSync } = await import("node:fs");
    const cfg = JSON.parse(readFileSync(new URL("../../../vercel.json", import.meta.url), "utf8"));
    const paths = (cfg.crons ?? []).map((c) => `${c.path} (${c.schedule})`);
    ctx.expect(paths.some((p) => p.includes("/api/cron/purge")), `crons: ${paths.join(", ") || "ninguno"}`);
    if (!paths.some((p) => p.includes("preventive-reminders"))) {
      return { note: `crons: ${paths.join(", ")}; los recordatorios corren dentro de purge` };
    }
    return { note: `crons: ${paths.join(", ")}` };
  }, { severity: "medium" });
}
