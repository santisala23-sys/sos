-- Actualizar imagen del colgante (credencial con lanyard)

UPDATE store_products
SET
  image_url = '/images/products/colgante-qr-lanyard.jpg',
  updated_at = NOW()
WHERE slug = 'colgante-qr';
