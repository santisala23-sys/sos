-- Notas del escaneador y estado de lectura para alertas del tutor

ALTER TABLE scan_logs
  ADD COLUMN IF NOT EXISTS scanner_note TEXT,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS note_added_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS scan_logs_unread_idx
  ON scan_logs (profile_id, scanned_at DESC)
  WHERE read_at IS NULL;
