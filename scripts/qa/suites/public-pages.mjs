const PUBLIC_PAGES = [
  "/",
  "/login",
  "/register",
  "/recuperar-contrasena",
  "/activar",
  "/ayuda",
  "/contacto",
  "/servicios/personas",
  "/servicios/mascotas",
  "/terminos",
  "/privacidad",
  "/cookies",
  "/retencion-datos",
  "/aviso-escaneadores-publicos",
  "/aviso-emergencia",
  "/aviso-datos-sensibles",
];

export default async function publicPages(ctx) {
  const anon = ctx.client();

  for (const path of PUBLIC_PAGES) {
    await ctx.check(`Página pública ${path} responde 200`, async () => {
      const res = await anon.get(path);
      ctx.expectStatus(res, 200, path);
      ctx.expect(res.text.includes("<html"), `${path} no devolvió HTML`);
    }, { severity: "high" });
  }

  await ctx.check("/tienda y /productos redirigen al catálogo de la home", async () => {
    for (const path of ["/tienda", "/productos"]) {
      const res = await anon.get(path);
      ctx.expectStatus(res, [307, 308], path);
      ctx.expect(res.location?.includes("#catalogo") || res.location?.endsWith("/"), `${path} → ${res.location}`);
    }
  }, { severity: "low" });

  await ctx.check("Sin sesión, /dashboard redirige a /login con redirect", async () => {
    const res = await anon.get("/dashboard/actividad");
    ctx.expectStatus(res, [307, 308]);
    ctx.expect(/\/login\?redirect=%2Fdashboard%2Factividad/.test(res.location ?? ""), `location=${res.location}`);
  }, { severity: "high" });

  await ctx.check("Sin sesión, /admin redirige a /login", async () => {
    const res = await anon.get("/admin");
    ctx.expectStatus(res, [307, 308]);
    ctx.expect(res.location?.includes("/login"), `location=${res.location}`);
  }, { severity: "high" });

  await ctx.check("Sin sesión, /verificar redirige a /login", async () => {
    const res = await anon.get("/verificar");
    ctx.expectStatus(res, [307, 308]);
    ctx.expect(res.location?.includes("/login"), `location=${res.location}`);
  });

  await ctx.check("Perfil público inexistente devuelve 404", async () => {
    const res = await anon.get("/p/no-existe-qa-123");
    ctx.expectStatus(res, 404);
  });

  await ctx.check("Cabeceras de seguridad (CSP con frame-ancestors 'none', nosniff)", async () => {
    const res = await anon.get("/");
    const csp = res.headers.get("content-security-policy") ?? "";
    ctx.expect(csp.includes("frame-ancestors 'none'"), "falta frame-ancestors 'none' en la CSP");
    ctx.expect(res.headers.get("x-content-type-options") === "nosniff", "falta X-Content-Type-Options: nosniff");
  }, { severity: "medium" });

  await ctx.check("Manifest PWA y service worker disponibles", async () => {
    const sw = await anon.get("/sw.js");
    ctx.expectStatus(sw, 200, "/sw.js");
    const manifest = await anon.get("/manifest.webmanifest");
    if (manifest.status !== 200) {
      const alt = await anon.get("/manifest.json");
      ctx.expectStatus(alt, 200, "manifest");
    }
  }, { severity: "medium" });

  await ctx.check("Clave pública VAPID expuesta y sana", async () => {
    const res = await anon.get("/api/push/vapid-public-key");
    ctx.expectStatus(res, 200);
    ctx.expect(res.json?.configured === true && res.json?.healthy === true, JSON.stringify(res.json));
  }, { severity: "high" });

  await ctx.check("Tiempo de respuesta de la home (< 1.5 s en build de producción)", async () => {
    const res = await anon.get("/");
    if (res.ms > 1500) return { warn: `La home tardó ${res.ms} ms` };
    return { note: `${res.ms} ms` };
  }, { severity: "low" });
}
