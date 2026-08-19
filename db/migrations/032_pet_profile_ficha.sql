-- Ficha opcional de mascota (raza, nacimiento) + historial de peso para libreta sanitaria.

ALTER TABLE qr_profiles
  ADD COLUMN IF NOT EXISTS pet_breed TEXT,
  ADD COLUMN IF NOT EXISTS pet_birth_date DATE;

ALTER TABLE qr_profiles
  ADD CONSTRAINT qr_profiles_pet_breed_len
  CHECK (pet_breed IS NULL OR char_length(btrim(pet_breed)) BETWEEN 1 AND 120);

CREATE TABLE IF NOT EXISTS pet_weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES qr_profiles (id) ON DELETE CASCADE,
  weight_kg NUMERIC(6, 2) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL,
  visit_id UUID REFERENCES pet_vet_visits (id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  vet_name TEXT,

  CONSTRAINT pet_weight_entries_source_check
    CHECK (source IN ('tutor', 'vet')),
  CONSTRAINT pet_weight_entries_kg_range
    CHECK (weight_kg > 0 AND weight_kg <= 200),
  CONSTRAINT pet_weight_entries_notes_len
    CHECK (char_length(notes) <= 500)
);

CREATE INDEX IF NOT EXISTS pet_weight_entries_pet_id_idx
  ON pet_weight_entries (pet_id, recorded_at DESC);
