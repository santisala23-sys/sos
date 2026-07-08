-- Self-service: exportación, solicitud de baja y purga programada

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deletion_scheduled_for TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_exported_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS users_deletion_scheduled_for_idx
  ON users (deletion_scheduled_for)
  WHERE deletion_requested_at IS NOT NULL AND deleted_at IS NULL;

