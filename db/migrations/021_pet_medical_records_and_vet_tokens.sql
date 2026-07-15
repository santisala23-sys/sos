-- Libreta sanitaria digital: historial médico de mascotas + tokens temporales para veterinarios.
-- Nota: este proyecto usa Neon PostgreSQL (acceso controlado en la app, no RLS de Supabase).

-- ---------------------------------------------------------------------------
-- pet_medical_records
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pet_medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES qr_profiles (id) ON DELETE CASCADE,
  record_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  name TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  verified_by_vet BOOLEAN NOT NULL DEFAULT FALSE,
  vet_name TEXT,
  vet_license TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pet_medical_records_type_check
    CHECK (record_type IN ('vaccine', 'deworming', 'treatment'))
);

CREATE INDEX IF NOT EXISTS pet_medical_records_pet_id_idx
  ON pet_medical_records (pet_id, event_date DESC, created_at DESC);

-- ---------------------------------------------------------------------------
-- vet_access_tokens (links temporales 24h para vista veterinario)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vet_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES qr_profiles (id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vet_access_tokens_token_idx
  ON vet_access_tokens (token);

CREATE INDEX IF NOT EXISTS vet_access_tokens_pet_id_idx
  ON vet_access_tokens (pet_id, created_at DESC);
