-- Collares QR destacados en catálogo (hueso / patita)

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
VALUES
  (
    'Collar QR Hueso',
    'collar-qr-hueso',
    'collar',
    'Chapita circular celeste con mosquetón. QR en el frente e identificación «Escaneame» con diseño hueso. Resistente al agua.',
    'Consultar',
    '/images/products/chapita-qr-mascotas-qr.jpg',
    1,
    TRUE
  ),
  (
    'Collar QR Patita',
    'collar-qr-patita',
    'collar',
    'Chapita circular celeste con mosquetón. QR en el frente e identificación «Escaneame» con huella. Resistente al agua.',
    'Consultar',
    '/images/products/chapita-qr-mascotas-front.jpg',
    2,
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
