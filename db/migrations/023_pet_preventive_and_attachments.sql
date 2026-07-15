-- Calendario de vacunas/desparasitaciones + adjuntos en visitas (imagenes/PDF).

-- ---------------------------------------------------------------------------
-- pet_preventive_items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_preventive_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES qr_profiles (id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  last_applied_at DATE,
  next_due_at DATE,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pet_preventive_items_kind_check
    CHECK (kind IN ('vaccine', 'deworming')),
  CONSTRAINT pet_preventive_items_name_len
    CHECK (char_length(btrim(name)) BETWEEN 1 AND 200),
  CONSTRAINT pet_preventive_items_notes_len
    CHECK (char_length(notes) <= 1000)
);

CREATE INDEX IF NOT EXISTS pet_preventive_items_pet_id_idx
  ON pet_preventive_items (pet_id, kind, next_due_at ASC NULLS LAST);

DROP TRIGGER IF EXISTS pet_preventive_items_set_updated_at ON pet_preventive_items;
CREATE TRIGGER pet_preventive_items_set_updated_at
  BEFORE UPDATE ON pet_preventive_items
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- pet_vet_visit_attachments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_vet_visit_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES pet_vet_visits (id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime TEXT NOT NULL,
  file_data BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pet_vet_visit_attachments_filename_len
    CHECK (char_length(filename) BETWEEN 1 AND 255),
  CONSTRAINT pet_vet_visit_attachments_mime_check
    CHECK (
      mime IN (
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf'
      )
    )
);

CREATE INDEX IF NOT EXISTS pet_vet_visit_attachments_visit_id_idx
  ON pet_vet_visit_attachments (visit_id, created_at ASC);
