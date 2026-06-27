-- Contacto secundario + suscripciones push (PWA)

ALTER TABLE qr_profiles
  ADD COLUMN IF NOT EXISTS secondary_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS secondary_contact_phone TEXT;

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx
  ON push_subscriptions (user_id);
