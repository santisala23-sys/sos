-- Tipo de sangre (solo perfiles de persona)

ALTER TABLE qr_profiles
  ADD COLUMN IF NOT EXISTS blood_type TEXT;

ALTER TABLE qr_profiles
  DROP CONSTRAINT IF EXISTS qr_profiles_blood_type_check;

ALTER TABLE qr_profiles
  ADD CONSTRAINT qr_profiles_blood_type_check
  CHECK (
    blood_type IS NULL
    OR blood_type = ''
    OR blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  );
