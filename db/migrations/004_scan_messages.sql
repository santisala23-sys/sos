-- Chat bidireccional por evento de escaneo

DO $$ BEGIN
  CREATE TYPE message_sender AS ENUM ('public', 'tutor');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS scan_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_log_id UUID NOT NULL REFERENCES scan_logs (id) ON DELETE CASCADE,
  sender message_sender NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scan_messages_scan_log_id_idx
  ON scan_messages (scan_log_id, created_at ASC);

-- Migrar notas antiguas al hilo de mensajes
INSERT INTO scan_messages (scan_log_id, sender, body, created_at)
SELECT id, 'public', scanner_note, COALESCE(note_added_at, scanned_at)
FROM scan_logs
WHERE scanner_note IS NOT NULL
  AND TRIM(scanner_note) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM scan_messages sm WHERE sm.scan_log_id = scan_logs.id
  );
