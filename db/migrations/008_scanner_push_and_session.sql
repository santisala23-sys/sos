-- Push para quien escaneó el QR (recibe mensajes del tutor)

CREATE TABLE IF NOT EXISTS scanner_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_log_id UUID NOT NULL REFERENCES scan_logs (id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scanner_push_subscriptions_scan_log_id_idx
  ON scanner_push_subscriptions (scan_log_id);
