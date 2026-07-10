-- Verificación de email en el registro

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_verification_code_hash TEXT,
  ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_verification_attempts INT NOT NULL DEFAULT 0;

-- Las cuentas existentes quedan verificadas (no las bloqueamos retroactivamente).
UPDATE users
SET email_verified_at = COALESCE(email_verified_at, created_at)
WHERE email_verified_at IS NULL;

-- Las cuentas creadas con Google se consideran verificadas por Google.
UPDATE users
SET email_verified_at = COALESCE(email_verified_at, created_at)
WHERE google_id IS NOT NULL AND email_verified_at IS NULL;
