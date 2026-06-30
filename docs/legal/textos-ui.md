# Textos para la UI — SOSme

**Versión:** 1.0 — Copy-paste listo para desarrollo

---

## 1. Checkbox registro / login con Google

**Etiqueta (obligatorio):**

> Acepto los [Terminos y Condiciones](/terminos) y la [Política de Privacidad](/privacidad) de SOSme.

**Variante corta:**

> Leí y acepto los Términos y la Política de Privacidad.

**Error de validación:**

> Tenés que aceptar los Términos y la Política de Privacidad para continuar.

**Nota OAuth:** el mismo checkbox de términos debe mostrarse antes de «Continuar con Google» en `/register` y `/login`. En `/register` también va el checkbox de elegibilidad.

---

## 1b. Checkbox mayoría de edad y legitimación (solo registro)

**Etiqueta (obligatorio en `/register`):**

> Declaro ser mayor de 18 años y contar con legitimación para usar SOSme como tutor responsable (titular, padre/madre/tutor legal, dueño o responsable del beneficiario al cargar datos de terceros, incluidos menores).

**Error de validación:**

> Tenés que confirmar que sos mayor de edad y que contás con legitimación para actuar como tutor responsable.

**Google OAuth:** cuentas nuevas solo se crean desde `/register` con ambos checkboxes marcados. Desde `/login`, Google solo funciona para cuentas existentes.

---

## 2. Checkbox datos sensibles (crear/editar perfil persona)

Mostrar cuando el usuario complete al menos uno de: alergias, notas médicas, tipo de sangre, o suba PDF clínico.

**Etiqueta (obligatorio si hay datos sensibles):**

> Declaro que tengo legitimación para cargar estos datos de salud, que cuento con el consentimiento expreso del titular (o soy el titular), y que entiendo que quien escanee el QR podrá ver esta información. [Más info](/aviso-datos-sensibles)

**Error:**

> Para guardar datos médicos necesitás confirmar el consentimiento.

---

## 3. Texto bajo botón de ubicación al escanear

**Debajo de «Compartir mi ubicación»:**

> Al compartir, enviamos tu ubicación GPS al tutor responsable para ayudar en la asistencia. Podés continuar sin ubicación. [Privacidad](/privacidad)

**Variante ultra-corta:**

> Solo se comparte si lo autorizás. [Más info](/privacidad)

---

## 4. Aviso escáner (banner superior en `/p/{slug}`)

**Título:** Estás viendo un perfil de emergencia SOSme

**Cuerpo:**

> Al abrir este QR se notifica al tutor. En emergencia grave llamá al **911**. [Qué datos se registran](/aviso-escaneadores-publicos)

---

## 5. Footer — links legales

**Bloque footer (landing y páginas públicas):**

```
SOSme — QR de emergencia y contacto

Términos · Privacidad · Cookies · Retención de datos · Aviso de emergencia

© 2026 [COMPLETAR: razón social]. Argentina.
```

**Links:**

| Texto | Ruta |
|-------|------|
| Términos | `/terminos` |
| Privacidad | `/privacidad` |
| Cookies | `/cookies` |
| Retención de datos | `/retencion-datos` |
| Aviso de emergencia | `/aviso-emergencia` |

---

## 6. Email tipo — solicitud ARCO / baja

**Asunto:** Solicitud ARCO — [Acceso / Rectificación / Cancelación / Oposición] — SOSme

**Cuerpo:**

```
Hola,

Soy [nombre y apellido], titular de la cuenta [email registrado en SOSme].

Solicito [indicar derecho: acceso a mis datos / rectificación de ___ / baja y eliminación de cuenta / oposición a ___].

[Opcional: IDs de perfiles afectados, detalle de rectificación]

Confirmo que soy titular de la cuenta o representante legal del titular [adjuntar acreditación si aplica].

Gracias.
```

---

## 7. Dashboard — recordatorio OAuth sin términos (si aplica)

Si un usuario entró por Google antes de implementar checkboxes:

> Para seguir usando SOSme, confirmá que aceptás los [Términos](/terminos) y la [Privacidad](/privacidad). [Aceptar]

---

## 8. Botón SOS — microcopy

> En emergencia grave, llamá al **911** además de usar este botón.

---

## 9. Push notifications — consentimiento Tutor

> Activá alertas para enterarte al instante cuando alguien escanea un QR. Podés desactivarlas cuando quieras.

---

## 10. Push notifications — consentimiento Escáner

> ¿Querés recibir respuestas del tutor en este dispositivo? (opcional)
