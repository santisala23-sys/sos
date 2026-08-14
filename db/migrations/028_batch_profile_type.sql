-- Categoría del lote: al activar el QR se abre el alta de persona, mascota u objeto.

ALTER TABLE qr_product_batches
  ADD COLUMN IF NOT EXISTS profile_type TEXT NOT NULL DEFAULT 'person';

ALTER TABLE qr_product_batches
  DROP CONSTRAINT IF EXISTS qr_product_batches_profile_type_check;

ALTER TABLE qr_product_batches
  ADD CONSTRAINT qr_product_batches_profile_type_check
  CHECK (profile_type IN ('person', 'pet', 'object'));
