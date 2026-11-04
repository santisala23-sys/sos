import { personProfile, scan, tutor } from "../fixtures.mjs";

export default async function security(ctx) {
  const t = await tutor(ctx);
  const p = await personProfile(ctx);

  await ctx.check("Endpoint interno de estado de lectura exige clave", async () => {
    const s = await scan(ctx, p.slug);
    const res = await ctx.client().get(`/api/internal/scan-logs/${s.scanLogId}/read-status`);
    if (res.status === 200) {
      ctx.finding({
        severity: "medium",
        title: "Endpoint interno sin autenticación",
        detail:
          "GET /api/internal/scan-logs/:id/read-status responde sin x-n8n-api-key (el chequeo está comentado). Con un id de escaneo cualquiera sabe si el tutor lo leyó y cuándo. Reactivar la validación de INTERNAL_N8N_KEY.",
      });
      ctx.expect(false, `sin clave → 200 ${res.text.slice(0, 80)}`);
    }
    ctx.expectStatus(res, [401, 403]);
  }, { severity: "medium" });

  await ctx.check("Inyección SQL en slug y códigos no rompe nada", async () => {
    const payloads = ["' OR '1'='1", "x'; DROP TABLE users; --", "%27%20OR%201=1"];
    for (const payload of payloads) {
      const scanRes = await ctx.client().post("/api/alerts/scan", { slug: payload });
      ctx.expectStatus(scanRes, [400, 404], `scan ${payload}`);
      const page = await ctx.client().get(`/p/${encodeURIComponent(payload)}`);
      ctx.expectStatus(page, [400, 404], `página ${payload}`);
      const act = await ctx.client().get(`/api/activar/${encodeURIComponent(payload)}`);
      ctx.expectStatus(act, [400, 404], `activar ${payload}`);
    }
    const [{ n }] = await ctx.sql("SELECT count(*)::int AS n FROM users");
    ctx.expect(n > 0, "la tabla users quedó vacía");
  }, { severity: "critical" });

  await ctx.check("IDs mal formados devuelven 400/404, no 500", async () => {
    const paths = [
      "/api/qr-profiles/no-es-uuid",
      "/api/scan-logs/no-es-uuid",
      "/api/qr-profiles/no-es-uuid/medical-records",
      "/api/qr-profiles/no-es-uuid/shares",
      "/api/vet-view/no-es-uuid",
    ];
    const bad = [];
    for (const path of paths) {
      const res = await t.client.get(path);
      if (res.status >= 500) bad.push(`${path} → ${res.status}`);
    }
    if (bad.length) {
      ctx.finding({
        severity: "low",
        title: "IDs mal formados devuelven 500",
        detail: `${bad.join(", ")}. Postgres rechaza el UUID y la ruta responde «Error interno» (y suma a apiErrors24h del admin). Validar con isUuid antes de consultar, como ya hacen medical-records y vet-view.`,
      });
    }
    ctx.expect(bad.length === 0, bad.join(" | "));
  }, { severity: "low" });

  await ctx.check("JSON mal formado devuelve 400, no 500", async () => {
    const bad = [];
    for (const path of ["/api/auth/login", "/api/auth/register", "/api/alerts/scan", "/api/store/orders", "/api/contact"]) {
      const res = await ctx.client().request("POST", path, { body: "{no-json", headers: { "content-type": "application/json" } });
      if (res.status >= 500) bad.push(`${path} → ${res.status}`);
    }
    if (bad.length) {
      ctx.finding({
        severity: "low",
        title: "JSON mal formado devuelve 500",
        detail: `${bad.join(", ")}: request.json() tira y withApi lo convierte en 500. Debería ser 400 «JSON inválido» (como ya hace /api/activar).`,
      });
      return { warn: `JSON roto responde 500 en: ${bad.join(", ")} (debería ser 400)` };
    }
  }, { severity: "low" });

  await ctx.check("Cookie de sesión con HttpOnly, Secure y SameSite=Lax", async () => {
    const res = await fetch(`${ctx.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "10.99.0.1" },
      body: JSON.stringify({ email: t.email, password: t.password }),
    });
    const cookie = res.headers.getSetCookie().find((c) => c.startsWith("sos_session="));
    ctx.expect(cookie, "no se setea la cookie");
    ctx.expect(/HttpOnly/i.test(cookie) && /Secure/i.test(cookie) && /SameSite=Lax/i.test(cookie), cookie.replace(/=[^;]+/, "=…"));
  }, { severity: "high" });

  await ctx.check("Mutaciones con sesión desde otro origen (CSRF)", async () => {
    const res = await t.client.patch(`/api/qr-profiles/${p.id}`, { instructions: "csrf qa" }, { headers: { origin: "https://evil.example", "sec-fetch-site": "cross-site" } });
    await t.client.patch(`/api/qr-profiles/${p.id}`, { instructions: "Hablarle con calma. Sensible a ruidos fuertes." });
    if (res.status === 200) {
      return { warn: "la API no chequea Origin; hoy la protege SameSite=Lax + JSON (un form cross-site no puede mandar application/json), pero no hay defensa explícita" };
    }
  }, { severity: "low" });

  await ctx.check("Errores 500 no filtran detalles internos", async () => {
    const res = await ctx.client().request("POST", "/api/auth/login", { body: "{", headers: { "content-type": "application/json" } });
    ctx.expect(!/at \w+ \(|node_modules|SELECT |stack/i.test(res.text ?? ""), `filtra detalles: ${res.text?.slice(0, 200)}`);
  }, { severity: "medium" });

  await ctx.check("Ninguna consulta SQL falló durante el QA", async () => {
    const errors = await ctx.dbErrors();
    const real = errors.filter((e) => !/duplicate key|violates check constraint|invalid input syntax for type uuid/.test(e.message));
    if (real.length) {
      return { warn: `${real.length} errores SQL: ${[...new Set(real.map((e) => e.message))].slice(0, 5).join(" | ")}` };
    }
    return { note: `${errors.length} errores esperables (restricciones/uuid inválido)` };
  }, { severity: "medium" });
}
