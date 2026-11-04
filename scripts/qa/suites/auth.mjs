import { tutor } from "../fixtures.mjs";

const VALID = {
  email: "nuevo@qa.test",
  password: "QaPass123",
  fullName: "Nuevo QA",
  acceptedTerms: true,
  declaredEligible: true,
};

export default async function auth(ctx) {
  await ctx.check("Registro rechaza datos incompletos, sin términos, sin declaración y contraseña débil", async () => {
    const c = ctx.client();
    const cases = [
      [{ ...VALID, email: "" }, "sin email"],
      [{ ...VALID, acceptedTerms: false }, "sin aceptar términos"],
      [{ ...VALID, declaredEligible: false }, "sin declarar mayoría de edad"],
      [{ ...VALID, password: "abc12" }, "contraseña corta"],
      [{ ...VALID, password: "soloLetras" }, "contraseña sin números"],
      [{ ...VALID, password: "12345678" }, "contraseña sin letras"],
    ];
    for (const [body, label] of cases) {
      const res = await c.post("/api/auth/register", body);
      ctx.expectStatus(res, 400, label);
    }
  }, { severity: "high" });

  const fresh = ctx.client({ label: "registro" });
  let registered = false;
  await ctx.check("Registro válido crea cuenta sin verificar y deja sesión", async () => {
    const res = await fresh.post("/api/auth/register", VALID);
    ctx.expectStatus(res, [200, 201]);
    ctx.expect(res.json?.needsVerification === true, "no indica needsVerification");
    ctx.expect(fresh.jar.has("sos_session"), "no dejó cookie de sesión");
    registered = true;
  }, { severity: "critical" });

  let code = null;
  await ctx.check("Llega el mail de verificación con código de 6 dígitos", async () => {
    const mail = await ctx.waitMail((m) => m.to.includes(VALID.email), { label: "mail de verificación" });
    code = /\b(\d{6})\b/.exec(mail.text || mail.html)?.[1];
    ctx.expect(code, "el mail no tiene un código de 6 dígitos");
    ctx.expect(/verificaci/i.test(mail.subject), `asunto inesperado: ${mail.subject}`);
    return { note: `Asunto: «${mail.subject}»` };
  }, { severity: "critical" });

  await ctx.check("Cuenta sin verificar: /dashboard redirige a /verificar", async () => {
    const res = await fresh.get("/dashboard");
    ctx.expectStatus(res, [307, 308]);
    ctx.expect(res.location?.includes("/verificar"), `location=${res.location}`);
  }, { severity: "high" });

  await ctx.check("Reenviar código enseguida respeta la espera de 60 s", async () => {
    const res = await fresh.post("/api/auth/resend-code", {});
    ctx.expectStatus(res, 429);
  }, { severity: "low" });

  await ctx.check("Código incorrecto o mal formado se rechaza", async () => {
    const wrong = code === "000000" ? "111111" : "000000";
    ctx.expectStatus(await fresh.post("/api/auth/verify-email", { code: wrong }), 400, "código incorrecto");
    ctx.expectStatus(await fresh.post("/api/auth/verify-email", { code: "12ab" }), 400, "código mal formado");
  }, { severity: "high" });

  await ctx.check("Código correcto verifica la cuenta y habilita el panel", async () => {
    ctx.expect(registered && code, "depende del registro y del mail");
    ctx.expectStatus(await fresh.post("/api/auth/verify-email", { code }), 200);
    const me = await fresh.get("/api/auth/me");
    ctx.expectStatus(me, 200, "/api/auth/me");
    ctx.expect(me.json?.emailVerified === true, `emailVerified=${me.json?.emailVerified}`);
    const dash = await fresh.get("/dashboard");
    ctx.expectStatus(dash, 200, "/dashboard");
  }, { severity: "critical" });

  await ctx.check("Email duplicado (incluso con mayúsculas) no permite otra cuenta", async () => {
    const c = ctx.client();
    ctx.expectStatus(await c.post("/api/auth/register", VALID), 409, "mismo email");
    const upper = await c.post("/api/auth/register", { ...VALID, email: "NUEVO@QA.TEST" });
    ctx.expectStatus(upper, [400, 409], "mismo email en mayúsculas");
  }, { severity: "high" });

  await ctx.check("Login: contraseña incorrecta y email inexistente dan el mismo error (sin enumeración)", async () => {
    const c = ctx.client();
    const wrongPass = await c.post("/api/auth/login", { email: VALID.email, password: "Otra1234" });
    const noUser = await c.post("/api/auth/login", { email: "nadie@qa.test", password: "Otra1234" });
    ctx.expectStatus(wrongPass, 401, "contraseña incorrecta");
    ctx.expectStatus(noUser, 401, "email inexistente");
    ctx.expect(wrongPass.json?.error === noUser.json?.error, `mensajes distintos: «${wrongPass.json?.error}» vs «${noUser.json?.error}»`);
  }, { severity: "medium" });

  await ctx.check("Login con email en mayúsculas funciona", async () => {
    const c = ctx.client();
    const res = await c.post("/api/auth/login", { email: "Nuevo@QA.test", password: VALID.password });
    ctx.expectStatus(res, 200);
  }, { severity: "medium" });

  await ctx.check("Logout cierra la sesión", async () => {
    const c = ctx.client();
    ctx.expectStatus(await c.post("/api/auth/login", { email: VALID.email, password: VALID.password }), 200, "login");
    ctx.expectStatus(await c.get("/api/auth/me"), 200, "me con sesión");
    ctx.expectStatus(await c.post("/api/auth/logout", {}), 200, "logout");
    ctx.expectStatus(await c.get("/api/auth/me"), 401, "me después del logout");
  }, { severity: "high" });

  await ctx.check("Sesión con JWT alterado se rechaza", async () => {
    const c = ctx.client();
    await c.post("/api/auth/login", { email: VALID.email, password: VALID.password });
    const token = c.jar.get("sos_session");
    const [h, p] = token.split(".");
    const payload = JSON.parse(Buffer.from(p, "base64url").toString());
    payload.userId = "00000000-0000-0000-0000-000000000000";
    c.setCookie("sos_session", `${h}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${token.split(".")[2]}`);
    ctx.expectStatus(await c.get("/api/auth/me"), 401);
    c.setCookie("sos_session", `${Buffer.from('{"alg":"none"}').toString("base64url")}.${p}.`);
    ctx.expectStatus(await c.get("/api/auth/me"), 401, "alg none");
  }, { severity: "critical" });

  let resetToken = null;
  await ctx.check("Recuperar contraseña: respuesta genérica y mail con enlace", async () => {
    const c = ctx.client();
    const unknown = await c.post("/api/auth/forgot-password", { email: "nadie@qa.test" });
    ctx.expectStatus(unknown, 200, "email inexistente");
    const known = await ctx.client().post("/api/auth/forgot-password", { email: VALID.email });
    ctx.expectStatus(known, 200, "email existente");
    ctx.expect(unknown.json?.message === known.json?.message, "los mensajes delatan si el email existe");
    const mail = await ctx.waitMail((m) => m.to.includes(VALID.email) && /contraseña/i.test(m.subject), { label: "mail de recuperación" });
    resetToken = /restablecer-contrasena\?token=([A-Za-z0-9_\-.%]+)/.exec(mail.text + mail.html)?.[1];
    ctx.expect(resetToken, "el mail no trae enlace /restablecer-contrasena?token=");
    ctx.expect(mail.text.includes(ctx.baseUrl) || mail.html.includes(ctx.baseUrl), "el enlace no usa NEXT_PUBLIC_APP_URL");
  }, { severity: "high" });

  await ctx.check("Restablecer contraseña cambia la clave y el token no se reutiliza", async () => {
    ctx.expect(resetToken, "depende del mail de recuperación");
    const c = ctx.client();
    ctx.expectStatus(await c.post("/api/auth/reset-password", { token: resetToken, password: "corta" }), 400, "contraseña débil");
    ctx.expectStatus(await c.post("/api/auth/reset-password", { token: decodeURIComponent(resetToken), password: "NuevaPass456" }), 200, "reset");
    ctx.expectStatus(await c.post("/api/auth/login", { email: VALID.email, password: VALID.password }), 401, "login con la clave vieja");
    ctx.expectStatus(await c.post("/api/auth/login", { email: VALID.email, password: "NuevaPass456" }), 200, "login con la clave nueva");
    ctx.expectStatus(await c.post("/api/auth/reset-password", { token: decodeURIComponent(resetToken), password: "OtraPass789" }), 400, "reutilizar token");
  }, { severity: "high" });

  await ctx.check("Recuperar contraseña: la página del enlace abre", async () => {
    const res = await ctx.client().get(`/restablecer-contrasena?token=${resetToken ?? "x"}`);
    ctx.expectStatus(res, 200);
  }, { severity: "medium" });

  await ctx.check("Verificación se bloquea tras 6 intentos fallidos", async () => {
    const c = ctx.client();
    const reg = await c.post("/api/auth/register", { ...VALID, email: "bloqueo@qa.test" });
    ctx.expectStatus(reg, [200, 201], "registro");
    const mail = await ctx.waitMail((m) => m.to.includes("bloqueo@qa.test"));
    const good = /\b(\d{6})\b/.exec(mail.text)?.[1];
    const bad = good === "999999" ? "888888" : "999999";
    const statuses = [];
    for (let i = 0; i < 7; i++) statuses.push((await c.post("/api/auth/verify-email", { code: bad })).status);
    const afterGood = await c.post("/api/auth/verify-email", { code: good });
    ctx.expect(statuses.includes(429), `nunca bloqueó: ${statuses.join(",")}`);
    ctx.expect(afterGood.status !== 200, "después del bloqueo el código correcto igual verificó");
    return { note: `estados: ${statuses.join(",")}; código correcto luego: ${afterGood.status}` };
  }, { severity: "high" });

  await ctx.check("Límite de intentos de login por IP (10 cada 15 min)", async () => {
    const c = ctx.client();
    const statuses = [];
    for (let i = 0; i < 12; i++) {
      statuses.push((await c.post("/api/auth/login", { email: VALID.email, password: "Mala0000" })).status);
    }
    ctx.expect(statuses.includes(429), `sin 429 tras 12 intentos: ${statuses.join(",")}`);
    return { note: `primer 429 en el intento ${statuses.indexOf(429) + 1}` };
  }, { severity: "high" });

  await ctx.check("El límite por IP se esquiva cambiando X-Forwarded-For (depende del proxy)", async () => {
    const statuses = [];
    for (let i = 0; i < 12; i++) {
      const c = ctx.client();
      statuses.push((await c.post("/api/auth/login", { email: VALID.email, password: "Mala0000" })).status);
    }
    if (!statuses.includes(429)) {
      ctx.finding({
        severity: "low",
        title: "El rate limit confía en X-Forwarded-For",
        detail:
          "getClientIp toma el primer valor de X-Forwarded-For. En Vercel ese header lo reescribe la plataforma, así que en producción no se puede falsear; detrás de otro proxy sí. Conviene preferir x-real-ip / x-vercel-forwarded-for.",
      });
      return { warn: "12 intentos con IPs distintas en X-Forwarded-For: ninguno bloqueado (en Vercel no aplica)" };
    }
  }, { severity: "low" });

  await ctx.check("Fixture: tutora QA registrada y verificada por el flujo real", async () => {
    const t = await tutor(ctx);
    ctx.expect(t.id, "sin id");
  }, { severity: "critical" });
}
