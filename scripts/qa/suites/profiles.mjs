import { otherTutor, personProfile, tutor, PERSON_DATA } from "../fixtures.mjs";

export default async function profiles(ctx) {
  const t = await tutor(ctx);
  const o = await otherTutor(ctx);
  const p = await personProfile(ctx);

  await ctx.check("El panel lista el perfil activado", async () => {
    const res = await t.client.get("/api/qr-profiles");
    ctx.expectStatus(res, 200);
    ctx.expect(res.json.profiles.some((x) => x.id === p.id), "el perfil no aparece en /api/qr-profiles");
  }, { severity: "critical" });

  for (const path of ["/dashboard", `/dashboard/perfiles/${p.id}`, `/dashboard/perfiles/${p.id}/editar`, `/dashboard/perfiles/${p.id}/compartir`, "/dashboard/actividad", "/dashboard/actividad/cerradas", "/dashboard/perfil", "/dashboard/ayuda"]) {
    await ctx.check(`Página del panel ${path.replace(p.id, ":id")} abre con sesión`, async () => {
      ctx.expectStatus(await t.client.get(path), 200);
    }, { severity: "high" });
  }

  await ctx.check("Otra cuenta no puede leer ni editar ni borrar el perfil", async () => {
    ctx.expectStatus(await o.client.get(`/api/qr-profiles/${p.id}`), [403, 404], "GET");
    ctx.expectStatus(await o.client.patch(`/api/qr-profiles/${p.id}`, { instructions: "hackeado" }), [403, 404], "PATCH");
    ctx.expectStatus(await o.client.del(`/api/qr-profiles/${p.id}`), [403, 404], "DELETE");
    const rows = await ctx.sql("SELECT instructions FROM qr_profiles WHERE id = $1", [p.id]);
    ctx.expect(rows[0].instructions !== "hackeado", "la edición ajena se guardó");
  }, { severity: "critical" });

  await ctx.check("Otra cuenta no puede abrir la vista previa del perfil ajeno", async () => {
    const res = await o.client.get(`/dashboard/perfiles/${p.id}/vista-publica`);
    ctx.expect(res.status !== 200 || !res.text.includes(PERSON_DATA.instructions), `status ${res.status} mostró el perfil ajeno`);
  }, { severity: "high" });

  await ctx.check("Editar instrucciones y contacto secundario se refleja en el perfil público", async () => {
    const res = await t.client.patch(`/api/qr-profiles/${p.id}`, {
      instructions: "Instrucciones QA actualizadas",
      secondary_contact_name: "Ana QA",
    });
    ctx.expectStatus(res, 200);
    const page = await ctx.client().get(`/p/${p.slug}`);
    ctx.expectStatus(page, 200, "perfil público");
    ctx.expect(page.text.includes("Instrucciones QA actualizadas"), "el perfil público no muestra las instrucciones nuevas");
  }, { severity: "critical" });

  await ctx.check("No se puede cambiar el nombre ni el tipo de perfil después de activar", async () => {
    ctx.expectStatus(await t.client.patch(`/api/qr-profiles/${p.id}`, { beneficiary_name: "Otro" }), [400, 403], "nombre");
    ctx.expectStatus(await t.client.patch(`/api/qr-profiles/${p.id}`, { profile_type: "pet" }), [400, 403], "tipo");
  }, { severity: "medium" });

  await ctx.check("Grupo sanguíneo inválido no se guarda tal cual", async () => {
    await t.client.patch(`/api/qr-profiles/${p.id}`, { blood_type: "Z+" });
    const [row] = await ctx.sql("SELECT blood_type FROM qr_profiles WHERE id = $1", [p.id]);
    ctx.expect(row.blood_type !== "Z+", "se guardó Z+");
    await t.client.patch(`/api/qr-profiles/${p.id}`, { blood_type: "O+" });
  }, { severity: "low" });

  await ctx.check("El perfil público escapa HTML (sin XSS en instrucciones)", async () => {
    const payload = `<img src=x onerror=alert(1)><script>alert("qa")</script>`;
    ctx.expectStatus(await t.client.patch(`/api/qr-profiles/${p.id}`, { instructions: payload }), 200);
    const page = await ctx.client().get(`/p/${p.slug}`);
    ctx.expect(!page.text.includes(`<script>alert("qa")</script>`), "el script se inyectó sin escapar");
    ctx.expect(!page.text.includes("<img src=x onerror"), "la etiqueta img se inyectó sin escapar");
    await t.client.patch(`/api/qr-profiles/${p.id}`, { instructions: PERSON_DATA.instructions });
  }, { severity: "critical" });

  await ctx.check("El perfil público muestra datos de emergencia y no expone el email del tutor", async () => {
    const page = await ctx.client().get(`/p/${p.slug}`);
    ctx.expectStatus(page, 200);
    ctx.expect(page.text.includes(PERSON_DATA.beneficiary_name), "no muestra el nombre");
    ctx.expect(page.text.includes("Penicilina"), "no muestra las alergias");
    ctx.expect(!page.text.includes(t.email), "el HTML público contiene el email del tutor");
    const phoneInHtml = page.text.includes("5491123456789");
    return { note: phoneInHtml ? "el teléfono viaja en el HTML inicial" : "el teléfono se pide aparte (/api/contact)" };
  }, { severity: "high" });

  await ctx.check("La vista previa del panel no registra escaneo", async () => {
    const [before] = await ctx.sql("SELECT count(*)::int AS n FROM scan_logs WHERE profile_id = $1", [p.id]);
    const res = await t.client.get(`/dashboard/perfiles/${p.id}/vista-publica`);
    ctx.expectStatus(res, 200);
    await ctx.sleep(500);
    const [after] = await ctx.sql("SELECT count(*)::int AS n FROM scan_logs WHERE profile_id = $1", [p.id]);
    ctx.expect(before.n === after.n, `se crearon ${after.n - before.n} escaneos`);
  }, { severity: "high" });

  await ctx.check("Desactivar el perfil corta el escaneo; reactivar lo restablece", async () => {
    ctx.expectStatus(await t.client.patch(`/api/qr-profiles/${p.id}`, { is_active: false }), 200, "desactivar");
    const scan = await ctx.client().post("/api/alerts/scan", { slug: p.slug });
    ctx.expectStatus(scan, 404, "escaneo de perfil inactivo");
    const page = await ctx.client().get(`/p/${p.slug}`);
    ctx.expect(!page.text.includes("Penicilina"), "el perfil inactivo sigue mostrando datos de salud");
    ctx.expectStatus(await t.client.patch(`/api/qr-profiles/${p.id}`, { is_active: true }), 200, "reactivar");
    ctx.expectStatus(await ctx.client().post("/api/alerts/scan", { slug: p.slug }), 200, "escaneo tras reactivar");
    return { note: `página del perfil inactivo: HTTP ${page.status}` };
  }, { severity: "critical" });

  await ctx.check("Borrar un perfil propio lo elimina y libera el QR", async () => {
    const [{ code }] = await (await import("../fixtures.mjs")).activationCodes(ctx, "person", 1);
    const created = await t.client.rotateIp().post(`/api/activar/${code}`, { ...PERSON_DATA, beneficiary_name: "Borrable QA" });
    ctx.expectStatus(created, [200, 201], "activar");
    const { id, slug } = created.json.profile;
    ctx.expectStatus(await t.client.del(`/api/qr-profiles/${id}`), 200, "borrar");
    ctx.expectStatus(await t.client.get(`/api/qr-profiles/${id}`), [403, 404], "GET después de borrar");
    const scan = await ctx.client().post("/api/alerts/scan", { slug });
    ctx.expectStatus(scan, 404, "escaneo después de borrar");
    const [act] = await ctx.sql("SELECT status, profile_id FROM qr_activations WHERE activation_code = $1", [code]);
    const again = await t.client.rotateIp().post(`/api/activar/${code}`, { ...PERSON_DATA, beneficiary_name: "Reusado QA" });
    const page = await ctx.client().get(`/activar/${code}`);
    if (again.status !== 200 && again.status !== 201) {
      ctx.finding({
        severity: "medium",
        title: "Borrar un perfil deja el producto físico inutilizable",
        detail: `Después de borrar el perfil, el código queda «${act?.status}» con profile_id null. Volver a activarlo devuelve ${again.status} («${again.json?.error}») y /activar/:code redirige a /p/:slug, que da 404. Quien compró una chapita y borra el perfil (o pide la baja de la cuenta) no puede reusarla. La ayuda dice «borra el perfil y su QR (acción irreversible)», pero no aclara que el producto queda muerto. Opción: al borrar, volver la activación a «unclaimed» y conservar public_slug.`,
      });
      return { warn: `el código quedó ${act?.status} sin perfil; reactivar → ${again.status}; /activar → ${page.status} ${page.location ?? ""}` };
    }
  }, { severity: "high" });
}
