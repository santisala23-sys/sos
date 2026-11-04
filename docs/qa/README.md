# QA end-to-end

`npm run qa` levanta una copia descartable de SOSme y recorre todo el uso de la plataforma: registro, activación, perfiles, escaneos, alertas, push, chat, co-tutores, libreta, veterinario, objetos, tienda, admin, cron y seguridad. **No toca producción.**

## Qué levanta

| Pieza | Detalle |
|---|---|
| Base | Postgres en memoria (PGlite) con todas las migraciones de `db/migrations`, servido con el protocolo HTTP de Neon en `127.0.0.1:5499`. La app lo usa vía `NEON_HTTP_ENDPOINT`. |
| Mail | Receptor SMTP en `127.0.0.1:2525`. Los tests leen los mails (códigos, enlaces). |
| Push | Claves VAPID de prueba. Los envíos a `https://push.qa.local/*` se desvían al receptor local (`scripts/qa/preload.cjs`) y los tests los descifran. |
| App | `next build` en `.next-qa` (no pisa el `.next` del dev server) y `next start -p 3100` con `NODE_ENV=production`. |

## Uso

```bash
npm run qa                       # compila y corre todo
npm run qa -- --skip-build       # reutiliza el build anterior
npm run qa -- --only=scan,push   # solo algunas suites
npm run qa -- --skip-build --keep  # deja la app en :3100 con los datos de QA para probar a mano
```

Con `--keep` se puede entrar a `http://localhost:3100` como `tutora@qa.test`, `admin@qa.test` u `otro@qa.test` (contraseña `QaPass123`).

Cada corrida deja en `.qa-runs/<fecha>/` un `results.json` y un `results.md` con todos los casos, los hallazgos y los errores SQL vistos. Los logs del servidor quedan en `.qa-runs/next.log`. Sale con código 1 si hay fallas.

## Estructura

- `scripts/qa/run.mjs`: orquesta infraestructura, build, servidor y suites.
- `scripts/qa/infra.mjs`: base, SMTP y receptor push.
- `scripts/qa/lib.mjs`: cliente HTTP con cookies por usuario, resultados y descifrado de push.
- `scripts/qa/fixtures.mjs`: usuarios, lotes y perfiles creados por los flujos reales.
- `scripts/qa/suites/*.mjs`: una suite por área. Cada `ctx.check` es un caso: si lanza, es falla; si devuelve `{ warn }`, es un aviso.

El último reporte está en [`reporte-2026-11-03.md`](reporte-2026-11-03.md).
