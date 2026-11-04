// Datos de QA compartidos entre suites. Se crean por los flujos reales de la app
// (registro + verificación, lote de admin, activación) y se memorizan.

function once(ctx, key, factory) {
  ctx.state.__fixtures ??= {};
  ctx.state.__fixtures[key] ??= factory();
  return ctx.state.__fixtures[key];
}

export const ADMIN_EMAIL = "admin@qa.test";

export function admin(ctx) {
  return once(ctx, "admin", () => ctx.createVerifiedUser({ email: ADMIN_EMAIL, fullName: "Admin QA" }));
}

export function tutor(ctx) {
  return once(ctx, "tutor", () => ctx.createVerifiedUser({ email: "tutora@qa.test", fullName: "María QA" }));
}

export function otherTutor(ctx) {
  return once(ctx, "other", () => ctx.createVerifiedUser({ email: "otro@qa.test", fullName: "Otro Tutor QA" }));
}

export function coTutor(ctx) {
  return once(ctx, "cotutor", () => ctx.createVerifiedUser({ email: "cotutor@qa.test", fullName: "Co Tutor QA" }));
}

/** Códigos de activación creados por el endpoint de admin (cae a SQL si el endpoint falla). */
export async function activationCodes(ctx, profileType, quantity = 1) {
  const { client } = await admin(ctx);
  const res = await client.post("/api/admin/product-batches", {
    partner_name: `QA ${profileType}`,
    quantity,
    profile_type: profileType,
    product_label: "QA",
  });
  if (res.status === 201 && Array.isArray(res.json?.activations)) {
    return res.json.activations.map((a) => ({ code: a.activation_code, slug: a.public_slug }));
  }
  ctx.finding({
    severity: "medium",
    title: "No se pudo crear lote por API de admin",
    detail: `POST /api/admin/product-batches → ${res.status} ${res.text?.slice(0, 200)}; se usó SQL directo`,
  });
  return (await ctx.createActivationCodes(profileType, quantity)).codes;
}

export const PERSON_DATA = {
  beneficiary_name: "Juan QA",
  emergency_contact_name: "María QA",
  emergency_contact_phone: "+5491123456789",
  secondary_contact_name: "Pedro QA",
  secondary_contact_phone: "+5491198765432",
  instructions: "Hablarle con calma. Sensible a ruidos fuertes.",
  medical_notes: "Epilepsia controlada",
  allergies: "Penicilina",
  blood_type: "O+",
  sensitiveDataConsent: true,
};

export const PET_DATA = {
  beneficiary_name: "Firulais QA",
  emergency_contact_name: "María QA",
  emergency_contact_phone: "+5491123456789",
  instructions: "Es amigable, no muerde.",
  pet_breed: "Mestizo",
  pet_birth_date: "2020-05-10",
};

export const OBJECT_DATA = {
  beneficiary_name: "Casco QA",
  emergency_contact_name: "María QA",
  emergency_contact_phone: "+5491123456789",
  instructions: "Si encontrás este casco, avisame.",
};

async function claim(ctx, owner, type, data) {
  const [{ code }] = await activationCodes(ctx, type, 1);
  const res = await owner.client.rotateIp().post(`/api/activar/${code}`, data);
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`No se pudo activar ${type}: ${res.status} ${res.text?.slice(0, 300)}`);
  }
  return { id: res.json.profile.id, slug: res.json.profile.slug, code, profile: res.json.profile };
}

export function personProfile(ctx) {
  return once(ctx, "person", async () => claim(ctx, await tutor(ctx), "person", PERSON_DATA));
}

export function petProfile(ctx) {
  return once(ctx, "pet", async () => claim(ctx, await tutor(ctx), "pet", PET_DATA));
}

export function objectProfile(ctx) {
  return once(ctx, "object", async () => claim(ctx, await tutor(ctx), "object", OBJECT_DATA));
}

export function otherProfile(ctx) {
  return once(ctx, "otherPerson", async () =>
    claim(ctx, await otherTutor(ctx), "person", { ...PERSON_DATA, beneficiary_name: "Ajeno QA" }),
  );
}

/** Dispositivo push registrado por un usuario (suscripción con claves reales). */
export async function registerPush(ctx, user, opts) {
  const sub = ctx.createPushSubscription(opts);
  const res = await user.client.post("/api/push/subscribe", {
    endpoint: sub.endpoint,
    keys: sub.keys,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) QA",
  });
  return { sub, res };
}

export function tutorPush(ctx) {
  return once(ctx, "tutorPush", async () => {
    const { sub, res } = await registerPush(ctx, await tutor(ctx));
    if (res.status !== 200) throw new Error(`push subscribe → ${res.status} ${res.text}`);
    return sub;
  });
}

export async function scan(ctx, slug, { headers = {}, client } = {}) {
  const scanner = client ?? ctx.client({ label: "scanner" });
  const res = await scanner.post(
    "/api/alerts/scan",
    { slug, userAgent: "QA scanner" },
    { headers },
  );
  return { scanner, res, scanLogId: res.json?.scanLogId, scanToken: res.json?.scanToken };
}

export const bearer = (token) => ({ authorization: `Bearer ${token}` });
