-- Actualizar imagen del colgante / credencial colgante

UPDATE store_products
SET
  image_url = '/images/products/colgante-qr-lanyard.jpg',
  updated_at = NOW()
WHERE slug IN ('colgante-qr', 'credencial-plastificada');
