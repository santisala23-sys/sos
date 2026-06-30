# Política de Cookies y Tecnologías Similares — SOSme

**Versión:** 1.0  
**Fecha de vigencia:** 30 de junio de 2026

## Índice

1. [Qué son cookies y tecnologías similares](#1-qué-son-cookies-y-tecnologías-similares)
2. [Quién las utiliza](#2-quién-las-utiliza)
3. [Inventario detallado](#3-inventario-detallado)
4. [localStorage y sessionStorage](#4-localstorage-y-sessionstorage)
5. [Service Worker y notificaciones push](#5-service-worker-y-notificaciones-push)
6. [Cookies de terceros](#6-cookies-de-terceros)
7. [Base legal](#7-base-legal)
8. [Cómo gestionar o desactivar](#8-cómo-gestionar-o-desactivar)
9. [Banner de cookies](#9-banner-de-cookies)
10. [Cambios](#10-cambios)
11. [Contacto](#11-contacto)
12. [No constituye asesoramiento legal](#12-no-constituye-asesoramiento-legal)

---

## 1. Qué son cookies y tecnologías similares

Las **cookies** son archivos pequeños que el navegador guarda en tu dispositivo. **Tecnologías similares** incluyen localStorage, cookies de sesión de escaneo y Service Workers.

## 2. Quién las utiliza

**[COMPLETAR: razón social]** opera SOSme en https://sos-alpha-lime.vercel.app

## 3. Inventario detallado

| Nombre | Tipo | Duración | Finalidad | ¿Obligatoria? |
|--------|------|----------|-----------|---------------|
| `sos_session` | Cookie httpOnly | 7 días | Mantener sesión del Tutor autenticado (JWT) | Sí, para usar cuenta |
| `google_oauth_state` | Cookie | 10 minutos | Protección CSRF en login con Google | Sí, si usás Google OAuth |
| `sosme_scan_{slug}` | Cookie (no httpOnly) | 48 horas | Token de sesión de escaneo por perfil | Sí, para chat/PDF en escaneo |
| Service Worker (`/sw.js`) | SW + cache | Persistente | Recibir notificaciones Web Push | No; solo si activás push |

## 4. localStorage y sessionStorage

| Clave | Duración | Finalidad |
|-------|----------|-----------|
| `sosme_scan_session_{slug}` | 48 h | Token escaneo, ID de log, fase GPS |
| `sosme_scanner_push_{scanLogId}` | Hasta borrar datos navegador | Marca si el escáner activó push |

Estos datos **no se comparten** con otros sitios. Permanecen en tu dispositivo.

## 5. Service Worker y notificaciones push

Si activás notificaciones:

- Registramos `/sw.js` en tu navegador
- Guardamos suscripción push (endpoint, claves) en nuestra base de datos
- VAPID identifica al remitente (`VAPID_SUBJECT`)

Podés revocar permisos desde la configuración del navegador o desuscribirte desde el panel del Tutor.

## 6. Cookies de terceros

| Tercero | Cuándo | Finalidad |
|---------|--------|-----------|
| **Google** | Login OAuth | Autenticación; sujetas a [políticas de Google](https://policies.google.com/privacy) |
| **Google Maps** | Al abrir enlace de ubicación | Mapa externo; no embebemos API con tracking propio |

No usamos cookies de publicidad ni analytics de terceros en la versión actual del producto.

## 7. Base legal

- **Cookies estrictamente necesarias:** ejecución del servicio solicitado (sesión, OAuth CSRF, escaneo)
- **Push y GPS:** consentimiento en el navegador/dispositivo
- Ley 25.326, Decreto 1558/2001 y buenas prácticas AAIP

## 8. Cómo gestionar o desactivar

Podés bloquear cookies desde tu navegador. Si desactivás las cookies necesarias, **no podrás** iniciar sesión como Tutor ni mantener sesión de escaneo para chat/PDF.

Instrucciones: Chrome → Configuración → Privacidad → Cookies; Firefox → Opciones → Privacidad; Safari → Preferencias → Privacidad.

## 9. Banner de cookies

**Estado actual:** SOSme **no muestra** un banner de cookies de consentimiento porque, a la fecha, solo utiliza cookies/tecnologías **estrictamente necesarias** para el funcionamiento y consentimiento puntual (push, GPS) en el flujo correspondiente.

Si en el futuro se incorporan analytics o marketing, deberá implementarse banner con granularidad de consentimiento.

## 10. Cambios

Actualizaremos esta Política cuando cambien las tecnologías usadas. Versión y fecha al inicio del documento.

## 11. Contacto

**[COMPLETAR: privacidad@sosme.app]**

## 12. No constituye asesoramiento legal

Borrador orientativo. Revisar con asesor legal antes de publicar.
