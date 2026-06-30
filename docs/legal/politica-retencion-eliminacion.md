# Política de Retención y Eliminación de Datos — SOSme

**Versión:** 1.0  
**Fecha de vigencia:** 30 de junio de 2026

## Índice

1. [Objeto](#1-objeto)
2. [Plazos de retención por categoría](#2-plazos-de-retención-por-categoría)
3. [Eliminación en cascada](#3-eliminación-en-cascada)
4. [Cómo solicitar baja de cuenta](#4-cómo-solicitar-baja-de-cuenta)
5. [Exportación de datos](#5-exportación-de-datos)
6. [Datos anonimizados o agregados](#6-datos-anonimizados-o-agregados)
7. [Backups](#7-backups)
8. [Estado actual del producto](#8-estado-actual-del-producto)
9. [Contacto](#9-contacto)
10. [No constituye asesoramiento legal](#10-no-constituye-asesoramiento-legal)

---

## 1. Objeto

Esta Política establece cuánto tiempo conservamos datos personales en SOSme y cómo podés solicitar su eliminación o exportación.

**Responsable:** [COMPLETAR: razón social] — [COMPLETAR: privacidad@sosme.app]

## 2. Plazos de retención por categoría

| Categoría | Plazo | Acción al vencer |
|-----------|-------|------------------|
| Cuenta Tutor activa | Indefinido mientras uses el servicio | — |
| Cuenta tras solicitud de baja | Eliminación en **30 días hábiles**; datos residuales en logs hasta plazos abajo | Borrado o anonimización |
| Perfiles QR | Mientras exista la cuenta o hasta eliminación manual/solicitud | DELETE en cascada |
| PDF clínico | Mientras exista el perfil | Borrado con perfil |
| `scan_logs` y mensajes asociados | **24 meses** desde `scanned_at` | Job de purga programado (*pendiente implementación*) |
| Push subscriptions (Tutor) | Hasta desuscripción o baja cuenta | DELETE |
| Push subscriptions (Escáner) | Hasta **48 h** / fin sesión / CASCADE con scan_log | DELETE |
| Sesión escaneo (localStorage/cookie) | **48 horas** | Expiración automática cliente |
| `api_request_logs` | **90 días** | Purga (*pendiente implementación*) |
| `security_audit_logs` | **12 meses** | Purga (*pendiente implementación*) |
| `rate_limit_buckets` | **24 horas** rolling | Expiración automática |
| Registro consentimientos legales | **5 años** tras baja | Archivo por obligación probatoria |

*Nota técnica:* los jobs de purga automática pueden no estar implementados aún. Hasta entonces, aplicamos eliminación manual o bajo solicitud ARCO.

## 3. Eliminación en cascada

Según el esquema de base de datos:

- Eliminar un **usuario** elimina sus **perfiles QR** (`ON DELETE CASCADE`)
- Eliminar un **perfil** elimina sus **scan_logs** y, en cascada, **scan_messages** y **scanner_push_subscriptions**
- Eliminar cuenta no borra automáticamente logs de API/auditoría donde `user_id` queda `SET NULL`

## 4. Cómo solicitar baja de cuenta

**Procedimiento actual (sin self-service):**

1. Enviá email desde tu cuenta registrada a **[COMPLETAR: privacidad@sosme.app]**
2. Asunto sugerido: «Solicitud de baja y eliminación de datos — SOSme»
3. Indicá email de cuenta y si querés eliminar todos los perfiles
4. Confirmaremos identidad y procesaremos en **30 días hábiles** como máximo

**Texto sugerido:** ver [textos-ui.md](./textos-ui.md)

Tras la baja:

- No podrás iniciar sesión
- Los perfiles QR dejarán de estar accesibles
- Las suscripciones push se eliminarán

## 5. Exportación de datos

Podés solicitar una copia de tus datos (cuenta, perfiles, logs de escaneo de tus perfiles) en formato estructurado (JSON/CSV). Plazo de respuesta: **10 días corridos** (ARCO — acceso).

**Estado actual:** exportación manual por el Operador; no hay botón «Descargar mis datos» en la UI.

## 6. Datos anonimizados o agregados

Podemos conservar estadísticas agregadas irreversibly anonimizadas (conteo de escaneos, métricas de uptime) sin identificar titulares.

## 7. Backups

Neon y Vercel pueden mantener backups temporales. Tras eliminación en producción, los datos pueden persistir en backups hasta **30–90 días** según el proveedor, luego rotación automática.

## 8. Estado actual del producto

Funcionalidades **no disponibles hoy** (redacción transitoria):

| Funcionalidad | Estado | Alternativa |
|---------------|--------|-------------|
| Eliminar cuenta desde dashboard | ❌ No implementado | Email a privacidad |
| Exportar datos desde dashboard | ❌ No implementado | Solicitud ARCO por email |
| Purga automática programada | ❌ No implementado | Retención manual / futuro cron |
| Desactivar perfil | ✅ `is_active = false` | Impide vista pública |

Compromiso: implementar self-service de baja y exportación en versiones futuras.

## 9. Contacto

**[COMPLETAR: privacidad@sosme.app]**

## 10. No constituye asesoramiento legal

Borrador orientativo. Revisar con asesor legal antes de publicar.
