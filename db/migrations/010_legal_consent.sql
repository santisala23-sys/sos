-- Consentimiento legal: términos, privacidad y datos sensibles

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version TEXT,
  ADD COLUMN IF NOT EXISTS privacy_policy_version TEXT;

ALTER TABLE qr_profiles
  ADD COLUMN IF NOT EXISTS sensitive_data_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sensitive_data_consent_version TEXT;
