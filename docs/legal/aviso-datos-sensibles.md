# Aviso de Datos Sensibles y Consentimiento — SOSme

**Versión:** 1.1  
**Fecha de vigencia:** 20 de agosto de 2026

---

## 1. Alcance

Este aviso aplica cuando un **Tutor** carga en un perfil de tipo **persona** datos considerados **sensibles** según el artículo 2 de la Ley 25.326 de Protección de Datos Personales de la República Argentina y normativa de la AAIP, incluyendo:

- Alergias
- Condiciones médicas crónicas / medicación (notas médicas)
- Tipo de sangre
- Obra social / prepaga y número de socio

**Archivos adjuntos:** la funcionalidad de almacenamiento de archivos adjuntos (como historial clínico en PDF) aplica de manera exclusiva a los perfiles de **Mascotas**. En el caso de perfiles de **Personas**, solo se procesan y exhiben los datos vitales ingresados en formato de texto.

## 2. Identificación del Operador

**Responsable del tratamiento:** {{legal_name}}
**Domicilio:** {{address}}
**Contacto privacidad:** somososme@gmail.com

## 3. Finalidad

Tratamos estos datos **únicamente** para:

- Mostrarlos en la vista pública del perfil QR cuando esté activo, a quien escanee el código
- En perfiles de **mascota**, permitir la descarga del PDF clínico opcional a quien tenga una sesión de escaneo válida
- Incluirlos en alertas al Tutor o en webhooks configurados por el Operador, cuando el flujo del evento lo requiera

**No** utilizamos datos de salud para publicidad, venta a terceros ni elaboración de perfiles comerciales.

## 4. Base legal y consentimiento

El tratamiento de datos sensibles requiere **consentimiento expreso, libre e informado** del titular de los datos, salvo las excepciones legales aplicables (art. 5 Ley 25.326).

Como Tutor, al marcar el casillero de consentimiento y cargar estos datos, declarás que:

1. Sos el titular de los datos **o** contás con legitimación suficiente (padre/madre/tutor legal, curador, apoderado con facultades, etc.)
2. Obtuviste el **consentimiento expreso** del titular cuando no sos vos, o estás legalmente habilitado para otorgarlo en su nombre
3. Informaste al titular (cuando corresponda) que los datos serán **visibles para quien escanee el QR** y podrán ser compartidos en alertas al Tutor
4. Los datos son **veraces** y relevantes para asistencia en emergencia o contacto
5. Entendés que SOSme **no es un servicio de emergencia oficial** ni sustituye atención médica profesional

## 5. Exposición por diseño del QR

Los datos sensibles cargados en el perfil de **persona** (texto) **serán accesibles** a terceros que escaneen el QR o accedan a la URL pública.

En perfiles de **mascota**, el PDF clínico opcional requiere sesión de escaneo activa, pero sigue estando disponible para quien haya escaneado recientemente.

Evaluá cuidadosamente qué información incluir. Podés omitir campos o desactivar el perfil en cualquier momento.

## 6. Transferencia internacional

Los datos se almacenan en servidores de **Neon (PostgreSQL)** y **Vercel**, con infraestructura principal en **Estados Unidos**. Esta transferencia se realiza con las garantías descritas en la [Política de Privacidad](/privacidad).

## 7. Conservación y eliminación

Los plazos de conservación figuran en la [Política de Retención y Eliminación de Datos](/retencion-datos). Podés solicitar rectificación o eliminación conforme a tus derechos ARCO.

## 8. Derechos del titular

El titular de los datos (o su representante legal) puede ejercer derechos de **Acceso, Rectificación, Cancelación y Oposición (ARCO)** escribiendo a **somososme@gmail.com**, acreditando identidad.

La AAIP es la autoridad de control en Argentina: [www.argentina.gob.ar/aaip](https://www.argentina.gob.ar/aaip).

## 9. Texto de consentimiento (UI)

El checkbox en la creación/edición de perfil debe incluir el texto indicado en [textos-ui.md](./textos-ui.md), sección «Consentimiento datos sensibles».

## 10. No constituye asesoramiento legal

Borrador orientativo. Revisar con asesor legal matriculado en Argentina antes de publicar.
