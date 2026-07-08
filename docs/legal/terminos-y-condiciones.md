# Términos y Condiciones de Uso — SOSme

**Versión:** 1.0  
**Fecha de vigencia:** 30 de junio de 2026  
**Última actualización:** 30 de junio de 2026

## Índice

1. [Identificación del prestador](#1-identificación-del-prestador)
2. [Aceptación de los Términos](#2-aceptación-de-los-términos)
3. [Descripción del servicio](#3-descripción-del-servicio)
4. [Naturaleza del servicio: no es emergencia oficial](#4-naturaleza-del-servicio-no-es-emergencia-oficial)
5. [Elegibilidad y cuentas de Tutor](#5-elegibilidad-y-cuentas-de-tutor)
6. [Perfiles QR y exposición de datos](#6-perfiles-qr-y-exposición-de-datos)
7. [Datos de terceros, menores y legitimación](#7-datos-de-terceros-menores-y-legitimación)
8. [Datos sensibles de salud](#8-datos-sensibles-de-salud)
9. [Escaneo público, ubicación y chat](#9-escaneo-público-ubicación-y-chat)
10. [Notificaciones, push y webhooks](#10-notificaciones-push-y-webhooks)
11. [Uso permitido y prohibido](#11-uso-permitido-y-prohibido)
12. [Propiedad intelectual](#12-propiedad-intelectual)
13. [Disponibilidad, limitaciones técnicas y responsabilidad](#13-disponibilidad-limitaciones-técnicas-y-responsabilidad)
14. [Suspensión y terminación](#14-suspensión-y-terminación)
15. [Modificaciones del servicio y de los Términos](#15-modificaciones-del-servicio-y-de-los-términos)
16. [Ley aplicable y jurisdicción](#16-ley-aplicable-y-jurisdicción)
17. [Contacto](#17-contacto)
18. [No constituye asesoramiento legal](#18-no-constituye-asesoramiento-legal)

---

## 1. Identificación del prestador

El servicio **SOSme** (en adelante, el **Servicio**) es operado por **{{legal_name}}** (en adelante, el **Operador**), con domicilio en **{{address}}**, CUIT/CUIL **{{cuit}}**.

Contacto general y legal: **{{privacy_email}}**

Sitio web: {{website_url}}

## 2. Aceptación de los Términos

Al registrarte, iniciar sesión (incluido mediante Google OAuth), crear o gestionar perfiles QR, o utilizar cualquier funcionalidad del Servicio, declarás haber leído, comprendido y aceptado estos Términos y Condiciones de Uso (en adelante, los **Términos**), nuestra [Política de Privacidad](/privacidad) y, cuando corresponda, la [Política de Cookies](/cookies).

Si no estás de acuerdo con estos Términos, no debés usar el Servicio.

## 3. Descripción del servicio

SOSme es una aplicación web progresiva (PWA) que permite a personas responsables (**Tutores**) crear y administrar perfiles de emergencia y contacto asociados a códigos QR. Cada perfil tiene una URL pública (`/p/{slug}`) accesible al escanear el QR.

Tipos de perfil soportados:

- **Persona** (incluye datos médicos opcionales)
- **Mascota**
- **Objeto** (equipaje, pertenencias, etc.)

Funcionalidades principales:

- Registro e inicio de sesión con email y contraseña, u OAuth con Google (si está habilitado)
- Creación, edición y desactivación de perfiles QR
- Vista pública al escanear el QR, con contactos, instrucciones y datos médicos según configuración
- Registro de escaneos y alertas SOS
- Geolocalización opcional del escáner
- Chat bidireccional por evento de escaneo entre el escáner y el Tutor
- Notificaciones push (Web Push) al Tutor y, opcionalmente, al escáner
- Webhook configurable por el Operador para integraciones externas (n8n, Make, etc.)
- Panel de administración interno restringido a emails autorizados

## 4. Naturaleza del servicio: no es emergencia oficial

**SOSme NO es un servicio de emergencia oficial** ni reemplaza a los sistemas públicos de atención de emergencias.

El Servicio **no garantiza** la recepción, entrega o lectura oportuna de alertas, notificaciones push, mensajes de chat, webhooks ni datos de ubicación.

En situaciones de riesgo para la vida o la integridad física, **debés contactar de inmediato** a los servicios de emergencia competentes, por ejemplo:

- **911** (emergencias generales en Argentina)
- **107** (SAME / emergencias médicas, según jurisdicción)
- Bomberos, policía u otros servicios locales correspondientes

Consultá el [Descargo de Responsabilidad de Emergencia](/aviso-emergencia) para más detalle.

## 5. Elegibilidad y cuentas de Tutor

Para crear una cuenta de Tutor debés:

- Tener al menos **18 años** o la mayoría de edad legal en tu jurisdicción
- Proporcionar información veraz y actualizada
- Mantener la confidencialidad de tus credenciales
- Notificarnos de accesos no autorizados a tu cuenta

El Operador puede suspender o cancelar cuentas que incumplan estos Términos o que representen riesgo para terceros o para el Servicio.

**Eliminación de cuenta:** al día de la vigencia de estos Términos, el Servicio **no ofrece eliminación automática de cuenta desde la interfaz de usuario**. Podés solicitar la baja y eliminación de tus datos conforme a la [Política de Retención y Eliminación de Datos](/retencion-datos), enviando un email a **somososme@gmail.com**. Procesaremos la solicitud en un plazo razonable, generalmente dentro de los **30 días hábiles**.

## 6. Perfiles QR y exposición de datos

Al crear un perfil QR, entendés y aceptás que:

- La URL pública (`/p/{slug}`) es **accesible a cualquier persona** que escanee el QR o conozca el enlace
- Los datos configurados como visibles (contactos, instrucciones, alergias, notas médicas, tipo de sangre, etc.) **serán expuestos** a quien acceda al perfil
- El slug es semi-público: aunque no sea adivinable fácilmente, **no constituye autenticación** ni seguridad por oscuridad
- El PDF clínico **no es descargable** solo con conocer el slug; requiere una sesión de escaneo activa con token válido (48 horas). Aun así, quien escanee el QR y mantenga sesión activa podrá descargarlo si el Tutor lo cargó
- Podés desactivar un perfil (`is_active = false`) para impedir su visualización pública, pero los escaneos previos y logs asociados pueden conservarse según nuestra política de retención

Sos responsable de decidir qué datos incluir en cada perfil y de la colocación física del QR (collar, pulsera, equipaje, etc.).

## 7. Datos de terceros, menores y legitimación

Como Tutor, podés cargar datos de **beneficiarios terceros** (familiares, menores, mascotas u objetos de terceros).

Declarás y garantizás que:

- Tenés **legitimación** para cargar y tratar esos datos (titular, padre/madre/tutor legal, curador, dueño responsable, etc.)
- Informaste al titular o representante legal, cuando corresponda, sobre el uso del Servicio y la exposición vía QR
- No cargarás datos de personas sin base legal que lo autorice

Para perfiles de **menores de edad**, solo podés crearlos si sos su padre, madre o tutor legal, o tenés autorización expresa del responsable legal.

## 8. Datos sensibles de salud

Los perfiles de tipo persona pueden incluir **datos sensibles** según la Ley 25.326 de Protección de Datos Personales de Argentina: alergias, notas médicas, tipo de sangre y PDF clínico.

Al cargar estos datos, declarás contar con **consentimiento expreso** del titular o de quien tenga legitimación para otorgarlo, conforme al [Aviso de Datos Sensibles y Consentimiento](/aviso-datos-sensibles).

El Operador trata estos datos únicamente para las finalidades descritas en la Política de Privacidad y no los utiliza para fines publicitarios ni de perfilado comercial.

## 9. Escaneo público, ubicación y chat

Quien escanee un QR (**Escáner**) sin crear cuenta:

- Genera un registro de escaneo (`scan_log`) con User-Agent del navegador
- Puede compartir **ubicación GPS** de forma opcional, sujeta al consentimiento del dispositivo/navegador en el momento del escaneo
- Puede enviar alertas SOS, notas y mensajes en un chat vinculado al evento
- Recibe un token de sesión de escaneo (48 h) almacenado en localStorage y cookie

El Escáner debe usar el Servicio de buena fe, sin acoso, spam ni suplantación. El Tutor puede ver los mensajes y datos compartidos en su panel.

Consultá el [Aviso para Escáneres Públicos](/aviso-escaneadores-publicos) (también visible en la vista de perfil).

## 10. Notificaciones, push y webhooks

### Web Push

El Tutor puede suscribirse a notificaciones push del navegador. El Escáner puede suscribirse opcionalmente para recibir respuestas del Tutor. Las push dependen del navegador, del sistema operativo y de la conectividad; **no garantizamos su entrega**.

### Webhook

Si el Operador configura `ALERT_WEBHOOK_URL`, ciertos eventos (escaneo, SOS, ubicación, mensajes) pueden enviarse a un servicio externo elegido por el Operador (n8n, Make, etc.). El Tutor que configure integraciones propias en el futuro será responsable de la legalidad del destino y del tratamiento posterior.

## 11. Uso permitido y prohibido

### Uso permitido

- Crear perfiles para emergencia y contacto legítimos
- Responder a escaneos y coordinar asistencia
- Usar alertas SOS de forma responsable ante situaciones reales o potencialmente urgentes

### Uso prohibido

Queda expresamente prohibido:

- Cargar datos falsos, engañosos o de terceros sin legitimación
- Usar el chat o las alertas para acoso, amenazas, spam o bromas malintencionadas
- Intentar acceder a perfiles, PDFs clínicos o paneles admin sin autorización
- Realizar ingeniería inversa, scraping masivo, ataques de denegación de servicio o elusión de rate limits
- Usar el Servicio para fines ilícitos o contrarios al orden público
- Revender o sublicenciar el Servicio sin autorización escrita del Operador

El Operador puede investigar abusos mediante logs de seguridad (IP hasheada, auditoría de eventos) y tomar medidas correctivas.

## 12. Propiedad intelectual

El software, diseño, marca **SOSme**, textos del sitio y documentación son propiedad del Operador o de sus licenciantes. No adquirís derechos de propiedad sobre el Servicio por usarlo.

Conservás la titularidad de los datos que cargues. Nos otorgás una licencia limitada para alojar, procesar y mostrar esos datos según la funcionalidad del Servicio y la Política de Privacidad.

## 13. Disponibilidad, limitaciones técnicas y responsabilidad

El Servicio se ofrece **"tal cual"** y **"según disponibilidad"**, dentro de los límites de la legislación aplicable.

No garantizamos:

- Disponibilidad ininterrumpida (dependemos de Vercel, Neon y terceros)
- Exactitud del GPS (puede ser impreciso o no disponible)
- Entrega de push, webhooks, emails o SMS
- Que un tercero que escanee el QR actúe correctamente o contacte a emergencias

**Limitación de responsabilidad:** en la máxima medida permitida por la ley argentina, el Operador no será responsable por daños indirectos, incidentales, lucro cesante, pérdida de datos o daños derivados de: (a) fallas de red o de terceros; (b) uso indebido del Servicio; (c) falta de contacto con servicios de emergencia oficiales; (d) datos incorrectos cargados por el Tutor; (e) acceso no autorizado derivado de la exposición del QR.

Nada en estos Términos limita derechos irrenunciables del consumidor conforme a la Ley 24.240 de Defensa del Consumidor, cuando resulte aplicable.

## 14. Suspensión y terminación

Podemos suspender o terminar tu acceso si incumplís estos Términos, si hay riesgo de seguridad, o por requerimiento legal.

Podés dejar de usar el Servicio en cualquier momento. La eliminación de datos se rige por la [Política de Retención y Eliminación](/retencion-datos).

## 15. Modificaciones del servicio y de los Términos

Podemos modificar funcionalidades, corregir errores o actualizar estos Términos. Publicaremos la versión vigente con su fecha en el sitio. Los cambios materiales serán comunicados por medios razonables (aviso en el sitio, email al Tutor registrado).

El uso continuado del Servicio después de la entrada en vigencia de cambios implica aceptación, salvo que la normativa exija consentimiento adicional.

## 16. Ley aplicable y jurisdicción

Estos Términos se rigen por las leyes de la **República Argentina**, incluyendo la Ley 25.326 de Protección de Datos Personales, el Decreto Reglamentario 1558/2001 y normativa de la Agencia de Acceso a la Información Pública (AAIP).

Para controversias, las partes se someten a los tribunales ordinarios de **{{jurisdiction}}**, renunciando a cualquier otro fuero, salvo normas imperativas en contrario.

Si tenés domicilio en la Ciudad Autónoma de Buenos Aires o en otra jurisdicción con normativa de defensa del consumidor, conservás los derechos que no puedan ser limitados por acuerdo.

## 17. Contacto

Consultas sobre estos Términos: **somososme@gmail.com**

Ejercicio de derechos de protección de datos (ARCO): ver [Política de Privacidad](/privacidad) y [Política de Retención y Eliminación](/retencion-datos).

## 18. No constituye asesoramiento legal

Este documento es un borrador orientativo redactado para el producto SOSme. **No constituye asesoramiento legal.** Recomendamos su revisión por un abogado matriculado en Argentina antes de su publicación definitiva.
