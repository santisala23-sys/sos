-- Datos del responsable legal (variables en políticas públicas)

CREATE TABLE IF NOT EXISTS legal_entity_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  legal_name TEXT,
  cuit TEXT,
  address TEXT,
  jurisdiction TEXT,
  privacy_email TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT legal_entity_settings_singleton CHECK (id = 'default')
);

INSERT INTO legal_entity_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;
