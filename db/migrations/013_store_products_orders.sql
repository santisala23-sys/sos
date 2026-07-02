-- Tienda: productos físicos con QR y pedidos (sin pago online por ahora)

CREATE TABLE IF NOT EXISTS store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  product_type TEXT NOT NULL DEFAULT 'otro'
    CHECK (product_type IN ('collar', 'colgante', 'iman', 'credencial', 'sticker', 'otro')),
  description TEXT NOT NULL DEFAULT '',
  price_cents INT,
  price_label TEXT NOT NULL DEFAULT 'Consultar',
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS store_products_active_idx ON store_products (is_active, sort_order);

CREATE TABLE IF NOT EXISTS store_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users (id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT,
  customer_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'contacted', 'confirmed', 'shipped', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS store_orders_status_idx ON store_orders (status, created_at DESC);

CREATE TABLE IF NOT EXISTS store_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES store_orders (id) ON DELETE CASCADE,
  product_id UUID REFERENCES store_products (id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 99),
  unit_price_label TEXT NOT NULL DEFAULT 'Consultar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS store_order_items_order_idx ON store_order_items (order_id);

-- Catálogo inicial (editable desde admin)
INSERT INTO store_products (name, slug, product_type, description, price_label, sort_order)
VALUES
  (
    'Collar con QR',
    'collar-qr',
    'collar',
    'Collar resistente al agua con chapita QR grabada. Ideal para mascotas o identificación infantil. Incluye activación de perfil SOSme.',
    'Consultar',
    10
  ),
  (
    'Colgante identificación',
    'colgante-qr',
    'colgante',
    'Colgante tipo credencial con QR en ambas caras. Perfecto para mochilas, viajes escolares o actividades al aire libre.',
    'Consultar',
    20
  ),
  (
    'Imán con QR',
    'iman-qr',
    'iman',
    'Imán resistente para heladera, auto o escritorio. QR visible para contacto rápido en casa u oficina.',
    'Consultar',
    30
  ),
  (
    'Credencial plastificada',
    'credencial-plastificada',
    'credencial',
    'Tarjeta plastificada tamaño credencial con QR, datos de contacto e instrucciones. Para personas, alergias o datos médicos.',
    'Consultar',
    40
  ),
  (
    'Sticker / etiqueta QR',
    'sticker-qr',
    'sticker',
    'Sticker vinílico resistente para valijas, notebooks, cascos o equipaje. QR de alta legibilidad.',
    'Consultar',
    50
  )
ON CONFLICT (slug) DO NOTHING;
