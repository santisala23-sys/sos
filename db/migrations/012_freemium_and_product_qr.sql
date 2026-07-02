-- Plan freemium: 1 QR gratis, ampliación manual vía admin o futuro cobro

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS max_profiles INT;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_tier_check;
ALTER TABLE users
  ADD CONSTRAINT users_plan_tier_check
  CHECK (plan_tier IN ('free', 'extended', 'partner'));

-- Base para QR en productos físicos (activación futura)
CREATE TABLE IF NOT EXISTS qr_product_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  product_label TEXT,
  notes TEXT,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qr_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES qr_product_batches (id) ON DELETE SET NULL,
  profile_id UUID REFERENCES qr_profiles (id) ON DELETE SET NULL,
  activation_code TEXT NOT NULL UNIQUE,
  public_slug TEXT,
  status TEXT NOT NULL DEFAULT 'unclaimed'
    CHECK (status IN ('unclaimed', 'claimed', 'disabled')),
  claimed_at TIMESTAMPTZ,
  claimed_by_user_id UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS qr_activations_code_idx ON qr_activations (activation_code);
CREATE INDEX IF NOT EXISTS qr_activations_status_idx ON qr_activations (status);
