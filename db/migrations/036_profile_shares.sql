-- Co-tutoría: compartir perfil QR con otra cuenta (permisos granulares).

CREATE TABLE IF NOT EXISTS profile_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES qr_profiles (id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  can_receive_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  can_view_profile BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit_profile BOOLEAN NOT NULL DEFAULT FALSE,
  can_view_health_book BOOLEAN NOT NULL DEFAULT FALSE,
  can_save_location BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profile_shares_not_self CHECK (owner_user_id <> shared_with_user_id),
  CONSTRAINT profile_shares_unique_active UNIQUE (profile_id, shared_with_user_id)
);

CREATE INDEX IF NOT EXISTS profile_shares_profile_id_idx
  ON profile_shares (profile_id);

CREATE INDEX IF NOT EXISTS profile_shares_shared_with_idx
  ON profile_shares (shared_with_user_id);

CREATE INDEX IF NOT EXISTS profile_shares_active_idx
  ON profile_shares (profile_id, shared_with_user_id)
  WHERE revoked_at IS NULL;
