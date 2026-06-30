# Matriz de cumplimiento — SOSme

**Versión:** 1.0 — 30 de junio de 2026

| # | Requisito legal (AR / buenas prácticas) | Documento / control | Estado | Acción pendiente |
|---|----------------------------------------|------------------------|--------|------------------|
| 1 | Informar identidad del responsable (Ley 25.326) | Términos §1, Privacidad §1 | 🟡 Borrador | Completar CUIT, domicilio, razón social |
| 2 | Finalidad y consentimiento en recolección | Privacidad §5, textos UI registro | 🟡 Parcial | Checkbox registro + campos DB |
| 3 | Datos sensibles — consentimiento expreso | Aviso datos sensibles, checkbox perfil | 🟡 Parcial | Checkbox en QrProfileForm + API |
| 4 | Política de privacidad accesible | `/privacidad` | 🟡 Borrador | Publicar página + footer |
| 5 | Términos de uso | `/terminos` | 🟡 Borrador | Publicar página + footer |
| 6 | Cookies / tecnologías similares | `/cookies` | 🟡 Borrador | Publicar página; sin banner (OK por ahora) |
| 7 | No es servicio de emergencia | Aviso emergencia, Términos §4, UI SOS | 🟡 Parcial | Banner escaneo + microcopy SOS |
| 8 | Aviso al escáner (transparencia) | Aviso escáneres, UI `/p/{slug}` | 🟡 Parcial | Banner en EmergencyProfileView |
| 9 | Geolocalización — consentimiento previo | LocationPrompt + Privacidad | 🟢 Implementado | Agregar microcopy legal bajo botón |
| 10 | Derechos ARCO + canal contacto | Privacidad §9, Retención §4 | 🟡 Borrador | Publicar email real; proceso interno |
| 11 | Eliminación de datos / baja | Retención §4 | 🔴 Gap producto | Self-service delete; mientras tanto email |
| 12 | Exportación de datos | Retención §5 | 🔴 Gap producto | Endpoint export o proceso manual documentado |
| 13 | Retención y plazos definidos | Retención §2 | 🟡 Política | Implementar jobs de purga |
| 14 | Seguridad de datos (art. 9 Ley 25.326) | Privacidad §8, Términos | 🟢 Implementado | Revisión periódica |
| 15 | Transferencia internacional informada | Privacidad §7 | 🟡 Borrador | Publicar en privacidad |
| 16 | Menores — legitimación tutor | Términos, Aviso sensibles §4 | 🟡 Borrador | — |
| 17 | Encargados / subprocesadores | Privacidad §6 | 🟡 Borrador | DPA con Vercel/Neon si escala |
| 18 | Registro AAIP base de datos | — | ⚪ Evaluar | Consultar abogado según volumen |
| 19 | Inventario de tratamientos (interno) | registro-tratamientos-inventario.md | 🟢 Borrador | Mantener actualizado |
| 20 | Registro versiones políticas | checklist § DB fields | 🟡 Parcial | Migración 010 + API register |
| 21 | Uso prohibido / moderación | Términos §11 | 🟡 Borrador | — |
| 22 | Limitación responsabilidad | Términos §13 | 🟡 Borrador | Revisión abogado (cláusulas adhesión) |
| 23 | Webhook — responsabilidad operador | Términos §10, Privacidad §6 | 🟢 Documentado | — |
| 24 | Panel admin — acceso restringido | Privacidad, Registro interno | 🟢 Implementado | Política acceso admin just-in-time |
| 25 | PDF clínico — acceso restringido | Privacidad §8, código | 🟢 Implementado | — |

**Leyenda:** 🟢 OK / implementado · 🟡 En progreso o borrador · 🔴 Gap · ⚪ A evaluar

## Prioridad sugerida (sprint legal)

1. Completar placeholders del responsable
2. Publicar `/terminos`, `/privacidad`, `/cookies`, `/aviso-emergencia`
3. Footer + checkbox registro + migración consentimiento
4. Checkbox datos sensibles + aviso escáner en UI
5. Revisión abogado
6. Self-service baja + exportación + purga automática
