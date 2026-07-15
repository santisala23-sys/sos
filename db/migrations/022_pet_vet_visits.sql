-- Visitas veterinarias: historial clínico por visita (qué se hizo + indicaciones opcionales).
-- Migra datos previos de pet_medical_records si existían.

CREATE TABLE IF NOT EXISTS pet_vet_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES qr_profiles (id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  summary TEXT NOT NULL,
  indications TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  verified_by_vet BOOLEAN NOT NULL DEFAULT FALSE,
  vet_name TEXT,
  vet_license TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pet_vet_visits_summary_len CHECK (char_length(summary) BETWEEN 1 AND 4000),
  CONSTRAINT pet_vet_visits_indications_len CHECK (char_length(indications) <= 4000),
  CONSTRAINT pet_vet_visits_tags_check CHECK (
    tags <@ ARRAY['vaccine', 'deworming', 'treatment', 'checkup']::TEXT[]
  )
);

CREATE INDEX IF NOT EXISTS pet_vet_visits_pet_id_idx
  ON pet_vet_visits (pet_id, visit_date DESC, created_at DESC);

-- Migración opcional desde el modelo anterior (registros sueltos).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'pet_medical_records'
  ) THEN
    INSERT INTO pet_vet_visits (
      pet_id, visit_date, summary, indications, tags,
      verified_by_vet, vet_name, vet_license, created_at
    )
    SELECT
      pet_id,
      event_date,
      CASE
        WHEN notes IS NOT NULL AND btrim(notes) <> ''
          THEN name || E'\n' || notes
        ELSE name
      END,
      '',
      ARRAY[record_type]::TEXT[],
      verified_by_vet,
      vet_name,
      vet_license,
      created_at
    FROM pet_medical_records;

    DROP TABLE pet_medical_records;
  END IF;
END $$;
