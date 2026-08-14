-- Permitir citas / controles en el calendario preventivo (además de vacuna y desparasitación).

ALTER TABLE pet_preventive_items
  DROP CONSTRAINT IF EXISTS pet_preventive_items_kind_check;

ALTER TABLE pet_preventive_items
  ADD CONSTRAINT pet_preventive_items_kind_check
  CHECK (kind IN ('vaccine', 'deworming', 'checkup'));
