-- SOS: permitir slugs opacos (NanoID 21 chars) además del formato legado.
-- Sin backfill: los perfiles existentes conservan su slug actual.

ALTER TABLE qr_profiles DROP CONSTRAINT IF EXISTS qr_profiles_slug_format;

ALTER TABLE qr_profiles
  ADD CONSTRAINT qr_profiles_slug_format CHECK (
    -- Formato legado: nombre-xxxx, producto-abc123, etc.
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    -- NanoID opaco de 21 caracteres (perfiles nuevos)
    OR slug ~ '^[A-Za-z0-9_-]{21}$'
  );
