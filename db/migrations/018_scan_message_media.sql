-- Foto y audio en mensajes del chat en vivo

ALTER TABLE scan_messages
  ADD COLUMN IF NOT EXISTS media_type TEXT
    CHECK (media_type IS NULL OR media_type IN ('image', 'audio')),
  ADD COLUMN IF NOT EXISTS media_mime TEXT,
  ADD COLUMN IF NOT EXISTS media_filename TEXT,
  ADD COLUMN IF NOT EXISTS media_data BYTEA;
