# Política de Privacidad — SOSme

**Versión:** 1.0  
**Fecha de vigencia:** 30 de junio de 2026  
**Última actualización:** 30 de junio de 2026

## Índice

1. [Responsable y contacto](#1-responsable-y-contacto)
2. [Alcance](#2-alcance)
3. [Marco normativo](#3-marco-normativo)
4. [Principios](#4-principios)
5. [Tabla de tratamientos](#5-tabla-de-tratamientos)
6. [Destinatarios y encargados (subprocesadores)](#6-destinatarios-y-encargados-subprocesadores)
7. [Transferencias internacionales](#7-transferencias-internacionales)
8. [Seguridad](#8-seguridad)
9. [Derechos ARCO y consultas](#9-derechos-arco-y-consultas)
10. [Menores](#10-menores)
11. [Cookies y tecnologías similares](#11-cookies-y-tecnologías-similares)
12. [Cambios a esta Política](#12-cambios-a-esta-política)
13. [No constituye asesoramiento legal](#13-no-constituye-asesoramiento-legal)

---

## 1. Responsable y contacto

| Campo | Dato |
|-------|------|
| Responsable | **{{legal_name}}** |
| CUIT/CUIL | **{{cuit}}** |
| Domicilio | **{{address}}** |
| Email privacidad / ARCO | **{{privacy_email}}** |
| Sitio web | {{website_url}} |

## 2. Alcance

Esta Política describe cómo **SOSme** trata datos personales cuando:

- Te registrás o iniciás sesión como **Tutor**
- Creás o gestionás **perfiles QR**
- **Escaneás** un QR sin cuenta (**Escáner**)
- Usás notificaciones push, chat, ubicación u otras funciones
- Accedés al panel **admin** (usuarios autorizados)

No aplica a sitios de terceros enlazados (Google Maps, WhatsApp, etc.), regidos por sus propias políticas.

## 3. Marco normativo

- Ley 25.326 de Protección de Datos Personales (Argentina)
- Decreto 1558/2001 (reglamentación)
- Normativa y guías de la **AAIP**
- Referencia complementaria: Reglamento General de Protección de Datos (UE) para usuarios fuera de Argentina, cuando corresponda

## 4. Principios

Tratamos datos con licitud, lealtad, finalidad determinada, proporcionalidad, calidad, seguridad y confidencialidad. Los datos sensibles de salud requieren consentimiento expreso adicional (ver [Aviso de Datos Sensibles](/aviso-datos-sensibles)).

---

## 5. Tabla de tratamientos

| Categoría de datos | Ejemplos concretos en SOSme | Titular | Finalidad | Base legal | Plazo de conservación | Destinatarios |
|--------------------|----------------------------|---------|-----------|------------|----------------------|---------------|
| **Cuenta Tutor** | Email, nombre completo, hash bcrypt de contraseña, `is_admin` | Tutor | Registro, autenticación, gestión de cuenta, panel admin | Ejecución del servicio; consentimiento (registro) | Mientras la cuenta esté activa + 90 días tras baja solicitada | Vercel, Neon; Google si OAuth |
| **OAuth Google** | Email verificado, nombre, avatar URL, `google_id` | Tutor | Login alternativo | Consentimiento al usar Google | Igual que cuenta | Google, Vercel, Neon |
| **Perfil QR — identificación** | Nombre beneficiario, slug, tipo (persona/mascota/objeto), estado activo | Beneficiario / Tutor | Perfil público QR, alertas | Ejecución; legitimación del Tutor | Mientras el perfil exista + backups según retención | Público que escanea; encargados |
| **Perfil QR — contacto** | Nombre/teléfono contacto emergencia y secundario | Contactos / Tutor | Asistencia, llamadas | Ejecución; consentimiento del Tutor | Igual que perfil | Escáneres; Tutor; webhook si configurado |
| **Perfil QR — asistencia** | Instrucciones de ayuda | Beneficiario / Tutor | Vista pública | Ejecución | Igual que perfil | Escáneres |
| **Datos sensibles de salud** | Alergias, notas médicas, tipo de sangre, PDF clínico (BYTEA ≤5 MB) | Beneficiario | Emergencia, información médica | **Consentimiento expreso** | Igual que perfil | Escáneres con sesión; Tutor; admin autorizado |
| **Escaneo (`scan_log`)** | Fecha/hora, tipo scan/SOS, User-Agent, lat/long opcional, nota escáner | Escáner (indirecto) | Alertas, historial Tutor, seguridad | Interés legítimo; consentimiento (GPS) | **24 meses** desde el evento (ver retención) | Tutor; admin; webhook |
| **Chat (`scan_messages`)** | Mensajes público ↔ tutor por evento | Escáner / Tutor | Comunicación durante incidente | Ejecución del servicio | **24 meses** o hasta eliminación del scan_log | Tutor; Escáner con sesión |
| **Sesión escaneo** | JWT 48h en localStorage + cookie por slug | Escáner | Autorizar chat, PDF, push escáner | Ejecución | **48 horas** | Solo dispositivo del escáner |
| **Push Tutor** | Endpoint, claves p256dh/auth | Tutor | Notificaciones de alertas | Consentimiento (navegador) | Hasta desuscripción o baja cuenta | Proveedor push del navegador |
| **Push Escáner** | Endpoint, claves, `scan_log_id` | Escáner | Respuestas del Tutor | Consentimiento | Hasta fin de sesión / 48h / desuscripción | Proveedor push |
| **Webhook alertas** | Payload JSON: nombre, teléfonos, GPS, notas, URL dashboard | Beneficiario / Tutor / Escáner | Integración n8n/Make u otro | Interés del Operador / Tutor | Depende del receptor externo | Operador del webhook |
| **Logs API** | Ruta, método, status, duración, hash IP, user_id | Tutor / Escáner | Seguridad, observabilidad | Interés legítimo | **90 días** | Admin; Neon |
| **Auditoría seguridad** | Login fallido, rate limit, acceso admin, PDF denegado | Usuarios | Prevención fraude | Interés legítimo | **12 meses** | Admin |
| **Rate limiting** | Clave bucket, contador, ventana temporal | — | Protección abuso | Interés legítimo | **24 horas** rolling | Neon |
| **Consentimientos legales** | `accepted_terms_at`, versión política, consentimiento datos sensibles | Tutor | Prueba de cumplimiento | Obligación legal / consentimiento | **5 años** tras baja | Neon |

*Los plazos detallados y procedimientos de eliminación están en la [Política de Retención y Eliminación](/retencion-datos).*

---

## 6. Destinatarios y encargados (subprocesadores)

| Proveedor | Rol | Ubicación aprox. | Datos tratados |
|-----------|-----|------------------|----------------|
| **Vercel Inc.** | Hosting, edge, ejecución serverless | EE.UU. / global | Tráfico HTTP, cookies sesión, logs infra |
| **Neon Tech** | Base de datos PostgreSQL | EE.UU. (US East) | Todos los datos persistentes |
| **Google LLC** | OAuth 2.0 (opcional) | EE.UU. / global | Email, nombre, avatar si usás «Continuar con Google» |
| **Google Maps** | Enlaces externos a mapas (no API embebida con tracking propio) | Global | Solo coordenadas en URL al abrir enlace |
| **Webhook configurable** | Integración alertas (`ALERT_WEBHOOK_URL`) | Definido por Operador | Payload de alertas |
| **Push services** | Entrega Web Push (navegador/OS) | Según dispositivo | Notificaciones |

No vendemos datos personales. Podemos divulgar información si la ley lo exige o para proteger derechos y seguridad.

## 7. Transferencias internacionales

Tus datos pueden almacenarse y procesarse en **Estados Unidos** y otras jurisdicciones donde operan Vercel y Neon. Adoptamos medidas contractuales y técnicas razonables (cifrado en tránsito TLS, contraseñas hasheadas, acceso restringido admin). Al usar el Servicio desde Argentina o el exterior, consentís esta transferencia en la medida permitida por la ley aplicable.

## 8. Seguridad

Medidas implementadas incluyen:

- Contraseñas con hash **bcrypt**; JWT en cookie **httpOnly** (Tutor, 7 días)
- PDF clínico solo con token de sesión de escaneo válido
- IPs almacenadas como **hash SHA-256** (no IP en claro en logs)
- Rate limiting y auditoría de eventos de seguridad
- Panel admin restringido a emails en `ADMIN_EMAILS`
- HTTPS en producción

Ningún sistema es 100% seguro. Notificanos incidentes a **somososme@gmail.com**.

## 9. Derechos ARCO y consultas

Podés ejercer **Acceso, Rectificación, Cancelación, Oposición**, revocar consentimientos y solicitar portabilidad cuando corresponda, escribiendo a **somososme@gmail.com** con:

- Nombre y email de la cuenta
- Derecho que querés ejercer
- Acreditación de identidad razonable

Respondemos en un plazo máximo de **10 días corridos** (Ley 25.326), prorrogables 5 días si es complejo.

**Eliminación de cuenta:** hoy no hay botón self-service; solicitá baja por email. Ver [Política de Retención](/retencion-datos).

Autoridad de control: **AAIP** — [www.argentina.gob.ar/aaip](https://www.argentina.gob.ar/aaip)

## 10. Menores

El Servicio está dirigido a Tutores mayores de edad. Los perfiles de menores deben ser creados solo por padres/madres/tutores legales. Si detectamos datos de menores sin legitimación, podemos eliminarlos.

## 11. Cookies y tecnologías similares

Ver [Política de Cookies](/cookies). Usamos cookies estrictamente necesarias, localStorage para sesión de escaneo y Service Worker para push.

## 12. Cambios a esta Política

Publicaremos la versión actualizada con fecha de vigencia. Cambios relevantes serán notificados por medios razonables. Registramos la versión aceptada al registrarte (`privacy_policy_version`).

## 13. No constituye asesoramiento legal

Este documento es un borrador orientativo. **No constituye asesoramiento legal.** Recomendamos revisión por abogado matriculado en Argentina antes de publicar.
