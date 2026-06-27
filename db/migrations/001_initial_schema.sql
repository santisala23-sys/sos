-- SOS: esquema inicial para Neon PostgreSQL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- users (tutores / familiares)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- qr_profiles
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE alert_type AS ENUM ('scan', 'sos');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS qr_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  beneficiary_name TEXT NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  medical_notes TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT qr_profiles_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE INDEX IF NOT EXISTS qr_profiles_tutor_id_idx ON qr_profiles (tutor_id);
CREATE INDEX IF NOT EXISTS qr_profiles_slug_idx ON qr_profiles (slug);
CREATE INDEX IF NOT EXISTS qr_profiles_active_slug_idx ON qr_profiles (slug) WHERE is_active = TRUE;

-- ---------------------------------------------------------------------------
-- scan_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES qr_profiles (id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latitude NUMERIC,
  longitude NUMERIC,
  user_agent TEXT,
  alert_type alert_type NOT NULL DEFAULT 'scan'
);

CREATE INDEX IF NOT EXISTS scan_logs_profile_id_idx ON scan_logs (profile_id);
CREATE INDEX IF NOT EXISTS scan_logs_scanned_at_idx ON scan_logs (scanned_at DESC);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
