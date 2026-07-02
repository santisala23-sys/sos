# QR en productos físicos — visión técnica SOSme

## Modelo freemium actual (B2C)

- Cada usuario registrado: **plan `free`**, **1 perfil QR**.
- Pedido de más perfiles: contacto → admin cambia `plan_tier` a `extended` o setea `max_profiles` en DB.
- Sin pagos online por ahora.

## Modelo B2B / ecommerce (fases)

### Fase 1 — Manual (ahora)

1. Marca contacta por `/productos` o WhatsApp.
2. Vos generás lote de slugs o perfiles en admin.
3. Imprimís etiquetas con QR apuntando a `https://sosme.app/p/{slug}` o a activación.

### Fase 2 — Activación por código (tablas ya creadas)

Tablas en migración `012`:

- **`qr_product_batches`** — lote de una marca (nombre, cantidad, notas).
- **`qr_activations`** — cada unidad física:
  - `activation_code` único (ej. en etiqueta pequeña o NFC)
  - `public_slug` opcional pre-asignado
  - `status`: `unclaimed` → `claimed`
  - `claimed_by_user_id` al registrarse el comprador

**Flujo comprador:**

1. Escanea QR en la prenda → landing `/activar/{code}` o `/p/{slug}?claim=CODE`
2. Si no tiene cuenta → registro (1 QR gratis ya usado por activación vinculada)
3. Completa perfil de emergencia/contacto
4. QR queda ligado a ese usuario

### Fase 3 — Tienda / checkout

- Catálogo: chapas, stickers, hang tags con QR pre-generados
- Checkout Mercado Pago → envío de códigos de activación por email/WhatsApp
- Panel partner: ver activaciones, métricas de escaneo

## Caso marca de ropa

| Pieza | Qué lleva el QR |
|-------|-----------------|
| Etiqueta interior | URL corta + código activación |
| Hang tag | Instrucciones “Escaneá para activar tu SOSme” |
| Post-compra | Opcional: email con link activación |

**Valor para la marca:** diferenciación, seguridad infantil/outdoor, post-venta, storytelling.

**Valor para SOSme:** volumen de activaciones, posible fee por lote o suscripción partner.

## Campos admin útiles (ya en DB)

```sql
-- Ampliar usuario que pidió más QR por contacto:
UPDATE users SET plan_tier = 'extended', max_profiles = 5 WHERE email = '...';

-- Partner marca:
UPDATE users SET plan_tier = 'partner', max_profiles = 100 WHERE email = '...';
```

## Próximo desarrollo sugerido

1. Página `/activar/[code]` + API claim
2. Admin: crear lote + export CSV de códigos/URLs para imprenta
3. Landing partner white-label (logo marca)
4. Métricas por batch en admin
