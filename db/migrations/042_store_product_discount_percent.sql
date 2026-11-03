ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS discount_percent INT NOT NULL DEFAULT 0;

ALTER TABLE store_products
  DROP CONSTRAINT IF EXISTS store_products_discount_percent_check;

ALTER TABLE store_products
  ADD CONSTRAINT store_products_discount_percent_check
  CHECK (discount_percent >= 0 AND discount_percent <= 100);
