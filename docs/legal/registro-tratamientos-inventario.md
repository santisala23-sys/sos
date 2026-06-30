# Registro de Tratamientos / Inventario de Datos — SOSme

> **DOCUMENTO INTERNO** — No publicar. Uso del Operador y administradores autorizados.

**Versión:** 1.0  
**Fecha:** 30 de junio de 2026  
**Responsable del registro:** [COMPLETAR]
**Última revisión:** 30/06/2026

---

## 1. Identificación del responsable

| Campo | Valor |
|-------|-------|
| Responsable | [COMPLETAR] |
| CUIT | [COMPLETAR] |
| Domicilio | [COMPLETAR] |
| Email DPD / privacidad | [COMPLETAR] |
| URL servicio | https://sos-alpha-lime.vercel.app |

## 2. Descripción del tratamiento global

**Nombre comercial:** SOSme  
**Tipo:** Plataforma web PWA de perfiles QR de emergencia y contacto  
**Ámbito geográfico usuarios:** Argentina, LATAM  
**Ubicación infraestructura:** Vercel (hosting), Neon PostgreSQL US East

## 3. Inventario de tratamientos

### T-001 — Gestión de cuentas Tutor

| Atributo | Detalle |
|----------|---------|
| Finalidad | Autenticación, gestión de perfiles, panel dashboard |
| Titulares | Tutores registrados |
| Categorías datos | Identificativos, credenciales (hash), contacto email |
| Base legal | Consentimiento; ejecución contractual |
| Origen | Directo del titular |
| Destinatarios | Neon, Vercel; Google si OAuth |
| Plazo | Vigencia cuenta + 90 días post-baja |
| Medidas seguridad | bcrypt, JWT httpOnly, rate limit login |
| Riesgo | Medio |

### T-002 — Perfiles QR públicos

| Atributo | Detalle |
|----------|---------|
| Finalidad | Información de emergencia accesible vía QR |
| Titulares | Beneficiarios (personas, mascotas, objetos) |
| Categorías datos | Identificación, contactos, instrucciones, datos salud opcionales, PDF |
| Base legal | Consentimiento Tutor; consentimiento expreso datos sensibles |
| Cesiones | Acceso público por diseño (escáner) |
| Plazo | Vigencia perfil |
| Riesgo | **Alto** (exposición pública datos salud) |

### T-003 — Escaneos y geolocalización

| Atributo | Detalle |
|----------|---------|
| Finalidad | Alertar Tutor, registrar evento, ubicación opcional |
| Titulares | Escáneres (a menudo no identificados) |
| Categorías datos | User-Agent, GPS opcional, timestamps, notas |
| Base legal | Interés legítimo; consentimiento GPS |
| Plazo | 24 meses |
| Riesgo | Medio |

### T-004 — Chat por evento de escaneo

| Atributo | Detalle |
|----------|---------|
| Finalidad | Comunicación Tutor ↔ escáner |
| Datos | Contenido mensajes, remitente (public/tutor) |
| Plazo | 24 meses (ligado a scan_log) |
| Riesgo | Medio (contenido libre — riesgo abuso) |

### T-005 — Notificaciones Web Push

| Atributo | Detalle |
|----------|---------|
| Finalidad | Alertas tiempo real |
| Datos | Endpoint push, claves criptográficas |
| Base legal | Consentimiento navegador |
| Plazo | Hasta baja suscripción |
| Riesgo | Bajo |

### T-006 — Webhook alertas (ALERT_WEBHOOK_URL)

| Atributo | Detalle |
|----------|---------|
| Finalidad | Integración automatización externa |
| Datos | Payload alerta (nombre, teléfonos, GPS, URLs) |
| Responsable destino | Operador / Tutor según configuración |
| Riesgo | Medio-Alto si URL mal configurada |

### T-007 — Observabilidad y seguridad

| Atributo | Detalle |
|----------|---------|
| Finalidad | Seguridad, debugging, auditoría |
| Datos | Logs API, audit events, IP hash |
| Base legal | Interés legítimo |
| Plazo | 90 días (API) / 12 meses (audit) |
| Acceso | Solo admin (`ADMIN_EMAILS`) |
| Riesgo | Bajo-Medio |

### T-008 — Panel administración

| Atributo | Detalle |
|----------|---------|
| Finalidad | Soporte, moderación, reenvío alertas |
| Acceso | Usuarios con `is_admin` o email en `ADMIN_EMAILS` |
| Datos accedidos | Usuarios, perfiles, escaneos, logs |
| Riesgo | **Alto** — acceso privilegiado |
| Controles | Middleware admin, audit log |

## 4. Encargados del tratamiento

| Encargado | Contrato / DPA | Fecha verificación |
|-----------|----------------|-------------------|
| Vercel Inc. | TOS + DPA estándar | [COMPLETAR] |
| Neon Tech | TOS + DPA | [COMPLETAR] |
| Google (OAuth) | OAuth + políticas Google | [COMPLETAR] |

## 5. Evaluación de impacto (EIPD / DPIA)

**Recomendación:** realizar EIPD formal por tratamiento de **datos de salud** con exposición pública vía QR (T-002). Estado: **pendiente**.

## 6. Incidentes de seguridad

| Fecha | Descripción | Acción | Notificación titulares / AAIP |
|-------|-------------|--------|-------------------------------|
| — | Sin incidentes registrados | — | — |

## 7. Historial de versiones de políticas

| Versión | Fecha vigencia | Cambios | Publicado |
|---------|----------------|---------|-----------|
| 1.0 | 2026-06-30 | Versión inicial | Pendiente |

## 8. Notas operativas

- Purga automática de logs: **no implementada** — programar cron
- Eliminación cuenta self-service: **no implementada**
- Registro AAIP: **consultar asesor**

---

*Documento confidencial. No constituye asesoramiento legal.*
