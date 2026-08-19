-- Historial de ubicaciones guardadas en perfiles objeto (varios estacionamientos por día).

CREATE TABLE IF NOT EXISTS object_saved_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES qr_profiles(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_object_saved_locations_profile_created
  ON object_saved_locations (profile_id, created_at DESC);
