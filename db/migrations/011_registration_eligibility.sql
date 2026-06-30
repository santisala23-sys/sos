-- Declaración de mayoría de edad y legitimación como tutor en el registro

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS declared_eligible_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS declared_eligible_version TEXT;
