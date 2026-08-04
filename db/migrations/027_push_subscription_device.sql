-- Metadatos de dispositivo para suscripciones push del tutor.

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE push_subscriptions
SET updated_at = created_at
WHERE updated_at IS NULL;
