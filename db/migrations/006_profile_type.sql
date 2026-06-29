-- Tipo de perfil: persona, mascota u objeto (valija, equipo, etc.)

ALTER TABLE qr_profiles
  ADD COLUMN IF NOT EXISTS profile_type TEXT NOT NULL DEFAULT 'person';

ALTER TABLE qr_profiles
  DROP CONSTRAINT IF EXISTS qr_profiles_profile_type_check;

ALTER TABLE qr_profiles
  ADD CONSTRAINT qr_profiles_profile_type_check
  CHECK (profile_type IN ('person', 'pet', 'object'));
