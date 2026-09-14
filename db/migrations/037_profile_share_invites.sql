-- Invitaciones por link para co-tutoría (WhatsApp, etc.)

CREATE TABLE IF NOT EXISTS profile_share_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES qr_profiles (id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  can_receive_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  can_view_profile BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit_profile BOOLEAN NOT NULL DEFAULT FALSE,
  can_view_health_book BOOLEAN NOT NULL DEFAULT FALSE,
  can_save_location BOOLEAN NOT NULL DEFAULT FALSE,
  share_expires_at TIMESTAMPTZ,
  invite_expires_at TIMESTAMPTZ NOT NULL,
  redeemed_by_user_id UUID REFERENCES users (id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profile_share_invites_profile_id_idx
  ON profile_share_invites (profile_id);

CREATE INDEX IF NOT EXISTS profile_share_invites_token_idx
  ON profile_share_invites (token);
