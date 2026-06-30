-- Seguridad, observabilidad y panel de administración

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE qr_profiles
  ADD COLUMN IF NOT EXISTS clinical_pdf_pin_hash TEXT;

-- Logs de requests API (observabilidad)
CREATE TABLE IF NOT EXISTS api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INT NOT NULL,
  duration_ms INT NOT NULL,
  ip_hash TEXT,
  user_id UUID REFERENCES users (id) ON DELETE SET NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS api_request_logs_created_at_idx
  ON api_request_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS api_request_logs_errors_idx
  ON api_request_logs (status_code, created_at DESC)
  WHERE status_code >= 400;

CREATE INDEX IF NOT EXISTS api_request_logs_path_idx
  ON api_request_logs (path, created_at DESC);

-- Rate limiting en base de datos (compatible con serverless)
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  bucket_key TEXT PRIMARY KEY,
  request_count INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rate_limit_buckets_window_idx
  ON rate_limit_buckets (window_start);

-- Auditoría de seguridad
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  ip_hash TEXT,
  user_id UUID REFERENCES users (id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS security_audit_logs_created_at_idx
  ON security_audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS security_audit_logs_event_type_idx
  ON security_audit_logs (event_type, created_at DESC);
