import { activationCodes, admin, otherTutor, tutor, PERSON_DATA, PET_DATA, personProfile } from "../fixtures.mjs";

export default async function activation(ctx) {
  let codes = [];
  await ctx.check("Admin crea un lote de 5 códigos de persona", async () => {
    await admin(ctx);
    codes = await activationCodes(ctx, "person", 5);
    ctx.expect(codes.length === 5, `devolvió ${codes.length} códigos`);
    ctx.expect(codes.every((c) => /^[A-Z2-9]{8}$/.test(c.code)), `formato inesperado: ${codes.map((c) => c.code).join(",")}`);
    ctx.expect(codes.every((c) => /^[A-Za-z0-9_-]{21}$/.test(c.slug)), "slug público no es opaco de 21 caracteres");
  }, { severity: "critical" });

  const [c1, c2, c3, c4, c5] = codes;

  await ctx.check("GET /api/activar/:code anónimo muestra el código sin reclamar", async () => {
    const res = await ctx.client().get(`/api/activar/${c1.code}`);
    ctx.expectStatus(res, 200);
    ctx.expect(res.json?.activation?.status === "unclaimed", JSON.stringify(res.json));
  }, { severity: "high" });

  await ctx.check("Página /activar/:code abre sin sesión", async () => {
    ctx.expectStatus(await ctx.client().get(`/activar/${c1.code}`), 200);
  }, { severity: "high" });

  await ctx.check("Activar sin sesión devuelve 401", async () => {
    ctx.expectStatus(await ctx.client().post(`/api/activar/${c1.code}`, PERSON_DATA), 401);
  }, { severity: "high" });

  const t = await tutor(ctx);

  await ctx.check("Activar código inexistente devuelve 404", async () => {
    ctx.expectStatus(await t.client.post("/api/activar/ZZZZZZZZ", PERSON_DATA), 404);
  });

  await ctx.check("Activar sin nombre/contacto o sin instrucciones devuelve 400", async () => {
    ctx.expectStatus(await t.client.rotateIp().post(`/api/activar/${c1.code}`, { ...PERSON_DATA, beneficiary_name: "" }), 400, "sin nombre");
    ctx.expectStatus(await t.client.rotateIp().post(`/api/activar/${c1.code}`, { ...PERSON_DATA, emergency_contact_phone: " " }), 400, "sin teléfono");
    ctx.expectStatus(await t.client.rotateIp().post(`/api/activar/${c1.code}`, { ...PERSON_DATA, instructions: "" }), 400, "sin instrucciones");
  }, { severity: "high" });

  await ctx.check("Datos de salud sin consentimiento expreso se rechazan", async () => {
    const res = await t.client.rotateIp().post(`/api/activar/${c1.code}`, { ...PERSON_DATA, sensitiveDataConsent: false });
    ctx.expectStatus(res, 400);
  }, { severity: "high" });

  let claimed = null;
  await ctx.check("Activación válida crea el perfil con el slug del producto", async () => {
    const res = await t.client.rotateIp().post(`/api/activar/${c1.code.toLowerCase().replace(/(.{4})/, "$1-")}`, PERSON_DATA);
    ctx.expectStatus(res, [200, 201]);
    claimed = res.json.profile;
    ctx.expect(claimed.slug === c1.slug, `slug ${claimed.slug} ≠ ${c1.slug}`);
    ctx.expect(claimed.sensitive_data_consent_at, "no guardó la fecha de consentimiento");
    return { note: "código ingresado en minúsculas y con guion: se normalizó bien" };
  }, { severity: "critical" });

  await ctx.check("Código ya activado: /activar/:code redirige al perfil público", async () => {
    const res = await ctx.client().get(`/activar/${c1.code}`);
    ctx.expectStatus(res, [307, 308]);
    ctx.expect(res.location?.includes(`/p/${c1.slug}`), `location=${res.location}`);
  }, { severity: "high" });

  await ctx.check("Otra cuenta no puede reclamar un código ya activado", async () => {
    const o = await otherTutor(ctx);
    const res = await o.client.rotateIp().post(`/api/activar/${c1.code}`, PERSON_DATA);
    ctx.expectStatus(res, 409);
  }, { severity: "critical" });

  await ctx.check("Reintentar la activación con la misma cuenta no duplica el perfil", async () => {
    const res = await t.client.rotateIp().post(`/api/activar/${c1.code}`, PERSON_DATA);
    ctx.expectStatus(res, [200, 201, 409]);
    const rows = await ctx.sql("SELECT count(*)::int AS n FROM qr_profiles WHERE slug = $1", [c1.slug]);
    ctx.expect(rows[0].n === 1, `hay ${rows[0].n} perfiles con ese slug`);
  }, { severity: "high" });

  await ctx.check("Dos cuentas activando el mismo código a la vez: una gana y la otra recibe 409", async () => {
    const o = await otherTutor(ctx);
    const [a, b] = await Promise.all([
      t.client.rotateIp().post(`/api/activar/${c2.code}`, PERSON_DATA),
      o.client.rotateIp().post(`/api/activar/${c2.code}`, { ...PERSON_DATA, beneficiary_name: "Carrera QA" }),
    ]);
    const statuses = [a.status, b.status].sort();
    const owners = await ctx.sql("SELECT count(*)::int AS n FROM qr_profiles WHERE slug = $1", [c2.slug]);
    ctx.expect(owners[0].n === 1, `quedaron ${owners[0].n} perfiles para el mismo código`);
    ctx.expect(statuses.filter((s) => s === 200 || s === 201).length === 1, `estados ${statuses.join(",")}`);
    if (statuses.includes(500)) {
      ctx.finding({
        severity: "low",
        title: "Activación simultánea del mismo código devuelve 500",
        detail:
          "claimActivationForUser crea el perfil antes del UPDATE protegido; el perdedor choca con el slug único y recibe «Error interno» en vez del 409 «El código fue activado por otra persona».",
      });
      return { warn: `una ganó, la otra recibió 500 en vez de 409 (${statuses.join(",")})` };
    }
    return { note: `estados ${statuses.join(",")}` };
  }, { severity: "medium" });

  await ctx.check("Código deshabilitado no se puede activar", async () => {
    await ctx.sql("UPDATE qr_activations SET status = 'disabled' WHERE activation_code = $1", [c3.code]);
    const res = await t.client.rotateIp().post(`/api/activar/${c3.code}`, PERSON_DATA);
    ctx.expectStatus(res, [400, 403, 409, 410]);
  }, { severity: "high" });

  await ctx.check("Crear perfil sin producto está deshabilitado (POST /api/qr-profiles → 403)", async () => {
    const res = await t.client.post("/api/qr-profiles", {});
    ctx.expectStatus(res, 403);
    ctx.expect(res.json?.code === "ACTIVATION_REQUIRED", JSON.stringify(res.json));
  }, { severity: "medium" });

  await ctx.check("Activar un código de mascota con datos de mascota (sin instrucciones obligatorias)", async () => {
    const [pet] = await activationCodes(ctx, "pet", 1);
    const res = await t.client.rotateIp().post(`/api/activar/${pet.code}`, { ...PET_DATA, instructions: "" });
    ctx.expectStatus(res, [200, 201]);
    ctx.expect(res.json.profile.profile_type === "pet", `profile_type=${res.json.profile.profile_type}`);
  }, { severity: "high" });

  await ctx.check("Fecha de nacimiento de mascota en el futuro se rechaza", async () => {
    const [pet] = await activationCodes(ctx, "pet", 1);
    const res = await t.client.rotateIp().post(`/api/activar/${pet.code}`, { ...PET_DATA, pet_birth_date: "2099-01-01" });
    ctx.expectStatus(res, 400);
  }, { severity: "low" });

  await ctx.check("Un código de persona ignora un profile_type distinto enviado por el cliente", async () => {
    const res = await t.client.rotateIp().post(`/api/activar/${c4.code}`, { ...PERSON_DATA, profile_type: "pet" });
    ctx.expectStatus(res, [200, 201]);
    ctx.expect(res.json.profile.profile_type === "person", `quedó ${res.json.profile.profile_type}`);
  }, { severity: "medium" });

  await ctx.check("Cuenta sin verificar no debería poder activar productos por API", async () => {
    const c = ctx.client();
    ctx.expectStatus(await c.post("/api/auth/register", {
      email: "sinverificar@qa.test", password: "QaPass123", fullName: "Sin Verificar", acceptedTerms: true, declaredEligible: true,
    }), [200, 201], "registro");
    const res = await c.post(`/api/activar/${c5.code}`, PERSON_DATA);
    if (res.status === 200 || res.status === 201) {
      ctx.finding({
        severity: "medium",
        title: "Las APIs no exigen email verificado",
        detail:
          "Solo el middleware de páginas (/dashboard, /admin) manda a /verificar. Una cuenta recién creada, sin confirmar el mail, puede activar productos, editar perfiles, compartir y suscribir push llamando a la API directo.",
      });
      return { warn: "una cuenta sin verificar activó un producto por API (200)" };
    }
  }, { severity: "medium" });

  await ctx.check("Activar varios productos seguidos desde la misma conexión", async () => {
    const batch = await activationCodes(ctx, "pet", 12);
    const familia = await ctx.createVerifiedUser({ email: "familia@qa.test", fullName: "Familia QA" });
    const statuses = [];
    for (const [i, c] of batch.entries()) {
      statuses.push((await familia.client.post(`/api/activar/${c.code}`, { ...PET_DATA, beneficiary_name: `Mascota ${i + 1}` })).status);
    }
    const blockedAt = statuses.indexOf(429);
    if (blockedAt !== -1) {
      ctx.finding({
        severity: "low",
        title: "Activar productos comparte el límite del login (10 cada 15 min)",
        detail: `POST /api/activar/:code usa el preset «auth». Una familia o un local que activa ${blockedAt + 1}+ chapitas seguidas desde el mismo wifi recibe «Demasiadas solicitudes» (los errores de validación también suman). Conviene un preset propio, por usuario y no por IP.`,
      });
      return { warn: `la activación ${blockedAt + 1} de 12 recibió 429` };
    }
  }, { severity: "low" });

  await ctx.check("Plan: /api/auth/me refleja la cantidad de perfiles", async () => {
    await personProfile(ctx);
    const me = await t.client.get("/api/auth/me");
    ctx.expectStatus(me, 200);
    const plan = me.json?.plan;
    ctx.expect(plan, "no hay plan en /api/auth/me");
    return { note: JSON.stringify(plan).slice(0, 200) };
  }, { severity: "low" });
}
