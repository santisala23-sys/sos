import { coTutor, otherTutor, personProfile, registerPush, tutor } from "../fixtures.mjs";

const ALERTS_ONLY = { can_receive_alerts: true };

export default async function sharing(ctx) {
  const t = await tutor(ctx);
  const co = await coTutor(ctx);
  const o = await otherTutor(ctx);
  const p = await personProfile(ctx);
  const sharesUrl = `/api/qr-profiles/${p.id}/shares`;

  await ctx.check("Compartir valida email, permisos y no permite compartir con uno mismo", async () => {
    ctx.expectStatus(await t.client.post(sharesUrl, { email: "", permissions: ALERTS_ONLY }), 400, "sin email");
    ctx.expectStatus(await t.client.post(sharesUrl, { email: co.email, permissions: {
      can_receive_alerts: false, can_view_profile: false, can_edit_profile: false, can_view_health_book: false, can_save_location: false,
    } }), 400, "sin permisos");
    ctx.expectStatus(await t.client.post(sharesUrl, { email: t.email, permissions: ALERTS_ONLY }), 400, "con uno mismo");
    const unknown = await t.client.post(sharesUrl, { email: "noexiste@qa.test", permissions: ALERTS_ONLY });
    ctx.expectStatus(unknown, 404, "email sin cuenta");
  }, { severity: "medium" });

  let shareId = null;
  await ctx.check("Compartir con co-tutor (solo alertas) y le llega el mail", async () => {
    const res = await t.client.post(sharesUrl, { email: co.email, permissions: ALERTS_ONLY });
    ctx.expectStatus(res, 200);
    shareId = res.json.share.id;
    const mail = await ctx.waitMail((m) => m.to.includes(co.email) && /compart/i.test(m.subject + m.text), { label: "mail de perfil compartido" });
    return { note: `asunto: «${mail.subject}»` };
  }, { severity: "high" });

  const coPush = await registerPush(ctx, co);
  await ctx.check("El co-tutor con permiso de alertas recibe el SOS", async () => {
    ctx.expectStatus(coPush.res, 200, "registrar push");
    const before = await ctx.pushCount(coPush.sub);
    ctx.expectStatus(await ctx.client().post("/api/alerts/sos", { slug: p.slug }), 200);
    const payload = await ctx.waitPush(coPush.sub, (x) => x.title.includes("SOS"), { after: before });
    ctx.expect(payload.title.includes(p.profile.beneficiary_name), payload.title);
  }, { severity: "critical" });

  await ctx.check("El co-tutor ve el perfil en «Compartidos conmigo» y el escaneo en Actividad", async () => {
    const shared = await co.client.get("/api/qr-profiles/shared-with-me");
    ctx.expectStatus(shared, 200);
    ctx.expect(shared.json.profiles.some((x) => x.id === p.id), "no aparece en shared-with-me");
    const logs = await co.client.get("/api/scan-logs");
    ctx.expectStatus(logs, 200);
    ctx.expect(logs.json.logs.some((l) => l.profile_id === p.id || l.beneficiary_name === p.profile.beneficiary_name), "no ve los escaneos del perfil compartido");
  }, { severity: "high" });

  await ctx.check("Co-tutor sin permiso de edición no puede editar ni gestionar accesos", async () => {
    ctx.expectStatus(await co.client.patch(`/api/qr-profiles/${p.id}`, { instructions: "editado por co" }), [403, 404], "editar");
    ctx.expectStatus(await co.client.post(sharesUrl, { email: o.email, permissions: ALERTS_ONLY }), [403, 404], "compartir");
    ctx.expectStatus(await co.client.del(`/api/qr-profiles/${p.id}`), [403, 404], "borrar");
  }, { severity: "critical" });

  await ctx.check("Con permiso de edición el co-tutor puede editar, pero no borrar", async () => {
    ctx.expectStatus(await t.client.patch(`${sharesUrl}/${shareId}`, { permissions: { ...ALERTS_ONLY, can_view_profile: true, can_edit_profile: true } }), 200, "dar permiso");
    ctx.expectStatus(await co.client.patch(`/api/qr-profiles/${p.id}`, { instructions: "Editado por el co-tutor QA" }), 200, "editar");
    ctx.expectStatus(await co.client.del(`/api/qr-profiles/${p.id}`), [403, 404], "borrar");
    await t.client.patch(`/api/qr-profiles/${p.id}`, { instructions: "Hablarle con calma. Sensible a ruidos fuertes." });
  }, { severity: "high" });

  await ctx.check("Sin permiso de alertas el co-tutor deja de recibir push", async () => {
    ctx.expectStatus(await t.client.patch(`${sharesUrl}/${shareId}`, { permissions: { can_receive_alerts: false, can_view_profile: true } }), 200);
    const before = await ctx.pushCount(coPush.sub);
    await ctx.client().post("/api/alerts/sos", { slug: p.slug });
    const extra = await ctx.noPush(coPush.sub, { after: before });
    ctx.expect(extra.length === 0, `recibió ${extra.length} push sin permiso`);
  }, { severity: "high" });

  await ctx.check("Un acceso vencido deja de valer", async () => {
    await ctx.sql("UPDATE profile_shares SET expires_at = NOW() - interval '1 minute', can_receive_alerts = TRUE WHERE id = $1", [shareId]);
    const before = await ctx.pushCount(coPush.sub);
    await ctx.client().post("/api/alerts/sos", { slug: p.slug });
    const extra = await ctx.noPush(coPush.sub, { after: before });
    ctx.expect(extra.length === 0, `recibió ${extra.length} push con el acceso vencido`);
    const shared = await co.client.get("/api/qr-profiles/shared-with-me");
    ctx.expect(!shared.json.profiles.some((x) => x.id === p.id), "sigue viendo el perfil vencido");
    await ctx.sql("UPDATE profile_shares SET expires_at = NULL WHERE id = $1", [shareId]);
  }, { severity: "high" });

  await ctx.check("Revocar el acceso lo saca de «Compartidos conmigo»", async () => {
    ctx.expectStatus(await t.client.del(`${sharesUrl}/${shareId}`), 200);
    const shared = await co.client.get("/api/qr-profiles/shared-with-me");
    ctx.expect(!shared.json.profiles.some((x) => x.id === p.id), "sigue viendo el perfil");
    ctx.expectStatus(await co.client.get(`/api/qr-profiles/${p.id}`), [403, 404], "GET del perfil");
  }, { severity: "critical" });

  let invite = null;
  await ctx.check("Link de invitación: se crea, se previsualiza sin sesión y se acepta", async () => {
    const res = await t.client.post(`${sharesUrl}/invite-link`, { permissions: ALERTS_ONLY });
    ctx.expectStatus(res, 200);
    invite = res.json;
    const token = /compartir\/([^/?#]+)/.exec(invite.inviteUrl)?.[1];
    ctx.expect(token, `inviteUrl inesperado: ${invite.inviteUrl}`);
    invite.token = token;
    ctx.expect(invite.whatsappUrl?.startsWith("https://wa.me/") || invite.whatsappUrl?.includes("whatsapp"), `whatsappUrl: ${invite.whatsappUrl}`);
    const preview = await ctx.client().get(`/api/profile-share-invites/${token}`);
    ctx.expectStatus(preview, 200, "preview");
    ctx.expectStatus(await ctx.client().get(`/compartir/${token}`), 200, "página");
    ctx.expectStatus(await ctx.client().post(`/api/profile-share-invites/${token}/accept`, {}), 401, "aceptar sin sesión");
    ctx.expectStatus(await co.client.post(`/api/profile-share-invites/${token}/accept`, {}), 200, "aceptar");
    const shared = await co.client.get("/api/qr-profiles/shared-with-me");
    ctx.expect(shared.json.profiles.some((x) => x.id === p.id), "no quedó compartido");
    if (preview.json?.ownerEmail) {
      ctx.finding({
        severity: "low",
        title: "La vista previa pública de una invitación muestra el email del dueño",
        detail: "GET /api/profile-share-invites/:token (sin sesión) devuelve ownerEmail. Quien reciba o reenvíe el link ve el email del tutor; alcanzaría con el nombre.",
      });
    }
  }, { severity: "high" });

  await ctx.check("Un link de invitación usado no sirve para otra cuenta", async () => {
    ctx.expect(invite?.token, "depende del link anterior");
    const res = await o.client.post(`/api/profile-share-invites/${invite.token}/accept`, {});
    ctx.expectStatus(res, 410);
  }, { severity: "high" });

  await ctx.check("El dueño no puede aceptar su propia invitación", async () => {
    const res = await t.client.post(`${sharesUrl}/invite-link`, { permissions: ALERTS_ONLY });
    const token = /compartir\/([^/?#]+)/.exec(res.json.inviteUrl)?.[1];
    ctx.expectStatus(await t.client.post(`/api/profile-share-invites/${token}/accept`, {}), [400, 403, 409]);
  }, { severity: "medium" });

  await ctx.check("Máximo 4 cuentas por perfil", async () => {
    const extra = [];
    for (let i = 0; i < 5; i++) extra.push(await ctx.createVerifiedUser({ email: `extra${i}@qa.test` }));
    const statuses = [];
    for (const u of extra) statuses.push((await t.client.post(sharesUrl, { email: u.email, permissions: ALERTS_ONLY })).status);
    ctx.expect(statuses.includes(400), `nunca frenó: ${statuses.join(",")}`);
    return { note: `estados: ${statuses.join(",")} (ya había 1 co-tutor por invitación)` };
  }, { severity: "medium" });

  await ctx.check("Otra cuenta no puede ver ni tocar los accesos de un perfil ajeno", async () => {
    ctx.expectStatus(await o.client.get(sharesUrl), [403, 404], "listar");
    ctx.expectStatus(await o.client.post(`${sharesUrl}/invite-link`, { permissions: ALERTS_ONLY }), [403, 404], "crear link");
  }, { severity: "critical" });

  ctx.finding({
    severity: "info",
    title: "Compartir revela si un email tiene cuenta",
    detail: "POST /shares con un email sin cuenta responde 404 «No hay una cuenta SOSme con ese email». Solo lo ve un usuario logueado y tiene rate limit general; es aceptable, pero vale saberlo.",
  });
}
