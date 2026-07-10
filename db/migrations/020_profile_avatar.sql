-- Foto de perfil (avatar) para persona, mascota u objeto.
-- Se guarda la imagen en la propia fila del perfil (bytea) + su mime.

ALTER TABLE qr_profiles
  ADD COLUMN IF NOT EXISTS avatar_data BYTEA,
  ADD COLUMN IF NOT EXISTS avatar_mime TEXT;
