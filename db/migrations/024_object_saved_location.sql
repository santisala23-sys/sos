-- Última ubicación guardada en perfiles de objeto (ej. auto estacionado).

ALTER TABLE qr_profiles
  ADD COLUMN IF NOT EXISTS saved_latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS saved_longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS saved_location_at TIMESTAMPTZ;
