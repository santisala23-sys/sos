# Checklist de implementación técnica — Documentación legal SOSme

**Versión:** 1.0 — 30 de junio de 2026

## Páginas a crear

| Ruta | Documento fuente | Prioridad |
|------|------------------|-----------|
| `/terminos` | `terminos-y-condiciones.md` | Alta |
| `/privacidad` | `politica-de-privacidad.md` | Alta |
| `/cookies` | `politica-de-cookies.md` | Alta |
| `/aviso-datos-sensibles` | `aviso-datos-sensibles.md` | Media |
| `/retencion-datos` | `politica-retencion-eliminacion.md` | Media |
| `/aviso-emergencia` | `descargo-responsabilidad-emergencia.md` | Alta |
| `/aviso-escaneadores-publicos` | `aviso-escaneadores-publicos.md` | Baja (contenido también en UI escaneo) |

**Implementación sugerida:** componente `LegalDocument` que lee markdown desde `docs/legal/` en server component.

## Footer con links legales

- [ ] Landing (`src/app/page.tsx`)
- [ ] Login / Register (`AuthPageShell` o layout auth)
- [ ] Dashboard (opcional, link discreto)
- [ ] Vista pública `/p/[slug]` (link mínimo a privacidad / aviso escáner)

## Checkboxes obligatorios

| Ubicación | Campo | Validación |
|-----------|-------|------------|
| `/register` — form email | `acceptedTerms: true` | Bloquear submit |
| `/register` y `/login` — antes Google OAuth | mismo checkbox | Deshabilitar botón Google |
| `QrProfileForm` — datos médicos | `sensitiveDataConsent: true` | Solo si hay alergias/notas/sangre/PDF |
| API `POST /api/auth/register` | rechazar si `!acceptedTerms` | 400 |
| API `POST/PATCH /api/qr-profiles` | rechazar si datos sensibles sin consent | 400 |

## Banner de cookies

**No obligatorio hoy** — solo cookies necesarias + consentimiento puntual (push/GPS).

Reevaluar si se agrega Google Analytics, Meta Pixel, etc.

## Registro de versiones de políticas

- [ ] Constante `LEGAL_VERSION = "1.0"` y `LEGAL_EFFECTIVE_DATE = "2026-06-30"` en `src/lib/legal/constants.ts`
- [ ] Mostrar versión y fecha al pie de cada página legal
- [ ] Guardar en DB al registrarse:
  - `users.accepted_terms_at` (timestamptz)
  - `users.terms_version` (text)
  - `users.privacy_policy_version` (text)
- [ ] Guardar en perfil al consentir datos sensibles:
  - `qr_profiles.sensitive_data_consent_at`
  - `qr_profiles.sensitive_data_consent_version`

## Migración DB

Archivo: `db/migrations/010_legal_consent.sql`

```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version TEXT,
  ADD COLUMN IF NOT EXISTS privacy_policy_version TEXT;

ALTER TABLE qr_profiles
  ADD COLUMN IF NOT EXISTS sensitive_data_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sensitive_data_consent_version TEXT;
```

## Google OAuth — gap conocido

Usuarios que solo usan Google deben aceptar términos **antes** del redirect o en primer acceso al dashboard. Implementar checkbox compartido en login/register.

## Textos en UI de escaneo

- [ ] Banner aviso escáner en `EmergencyProfileView`
- [ ] Microcopy bajo `LocationPrompt` (GPS)
- [ ] Microcopy botón SOS

## Jobs futuros (retención)

- [ ] Cron purga `scan_logs` > 24 meses
- [ ] Cron purga `api_request_logs` > 90 días
- [ ] Cron purga `security_audit_logs` > 12 meses
- [ ] Endpoint self-service `DELETE /api/auth/account`
- [ ] Endpoint export `GET /api/auth/export`

## Antes de producción

- [ ] Completar placeholders [COMPLETAR] en todos los documentos
- [ ] Revisión abogado AR
- [ ] Registrar base de datos en AAIP si corresponde por escala/actividad
- [ ] Verificar `VAPID_SUBJECT` usa email real del responsable
