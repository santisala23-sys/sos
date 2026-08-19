-- SOS: obra social / prepaga para perfiles de persona (emergencia humana).

ALTER TABLE qr_profiles
  ADD COLUMN IF NOT EXISTS health_insurance TEXT;

DO $$ BEGIN
  ALTER TABLE qr_profiles
    ADD CONSTRAINT qr_profiles_health_insurance_len
    CHECK (
      health_insurance IS NULL
      OR char_length(btrim(health_insurance)) BETWEEN 1 AND 200
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
