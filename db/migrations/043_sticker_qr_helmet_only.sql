-- El sticker del catálogo queda solo con la foto del casco.
UPDATE store_products
SET
  image_url = '/images/products/sticker-qr-casco.jpg',
  gallery_urls = '["/images/products/sticker-qr-casco.jpg"]'::jsonb,
  description = 'Sticker vinílico resistente para cascos. QR de alta legibilidad.',
  updated_at = NOW()
WHERE slug = 'sticker-qr'
   OR product_type = 'sticker';
