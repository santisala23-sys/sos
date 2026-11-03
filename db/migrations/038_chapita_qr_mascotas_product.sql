-- Chapita circular QR SOSme (catálogo tienda)

INSERT INTO store_products (
  name,
  slug,
  product_type,
  description,
  price_label,
  image_url,
  sort_order,
  is_active
)
VALUES (
  'Chapita QR SOSme',
  'chapita-qr-mascotas',
  'collar',
  'Chapita circular resistente con mosquetón para collar. QR de alta legibilidad y diseño «Escaneame» con huella. Incluye activación de perfil SOSme para tu mascota.',
  'Consultar',
  '/images/products/chapita-qr-mascotas-qr.jpg',
  1,
  TRUE
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  product_type = EXCLUDED.product_type,
  description = EXCLUDED.description,
  price_label = EXCLUDED.price_label,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
