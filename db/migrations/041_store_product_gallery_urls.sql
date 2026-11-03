-- Galería de imágenes por producto (URLs públicas, una o más)

ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS gallery_urls JSONB NOT NULL DEFAULT '[]'::jsonb;
