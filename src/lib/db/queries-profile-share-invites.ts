import type { ProfileShare, ProfileType } from "@/types/database";
import { getSql } from "@/lib/db/index";
import { ensureDeferredMigrations } from "@/lib/db/ensure-schema";
import type { ProfileSharePermissionsInput } from "@/lib/profile-access";
import { PROFILE_SHARE_INVITE_TTL_MS } from "@/lib/profile-access";
import { generateOpaqueSlug } from "@/lib/utils/slug";
import {
  countActiveProfileShares,
  upsertProfileShare,
} from "@/lib/db/queries-profile-shares";

export type ProfileShareInvite = ProfileSharePermissionsInput & {
  id: string;
  profile_id: string;
  owner_user_id: string;
  token: string;
  share_expires_at: string | null;
  invite_expires_at: string;
  redeemed_by_user_id: string | null;
  redeemed_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export type ProfileShareInvitePreview = {
  invite: ProfileShareInvite;
  profile_name: string;
  profile_type: ProfileType;
  owner_name: string | null;
  owner_email: string;
};

function mapInvite(row: Record<string, unknown>): ProfileShareInvite {
  return row as unknown as ProfileShareInvite;
}

export async function countPendingProfileShareInvites(profileId: string): Promise<number> {
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM profile_share_invites
    WHERE profile_id = ${profileId}
      AND revoked_at IS NULL
      AND redeemed_at IS NULL
      AND invite_expires_at > NOW()
  `;
  return (rows[0] as { count: number }).count;
}

export async function countUsedProfileShareSlots(profileId: string): Promise<number> {
  const [shares, invites] = await Promise.all([
    countActiveProfileShares(profileId),
    countPendingProfileShareInvites(profileId),
  ]);
  return shares + invites;
}

export async function createProfileShareInvite(params: {
  profileId: string;
  ownerUserId: string;
  permissions: ProfileSharePermissionsInput;
  shareExpiresAt: string | null;
}): Promise<ProfileShareInvite | null> {
  await ensureDeferredMigrations();
  const sql = getSql();

  const profileRows = await sql`
    SELECT id FROM qr_profiles
    WHERE id = ${params.profileId} AND tutor_id = ${params.ownerUserId}
    LIMIT 1
  `;
  if (!profileRows[0]) return null;

  const token = generateOpaqueSlug(32);
  const inviteExpiresAt = new Date(Date.now() + PROFILE_SHARE_INVITE_TTL_MS).toISOString();

  const rows = await sql`
    INSERT INTO profile_share_invites (
      profile_id,
      owner_user_id,
      token,
      can_receive_alerts,
      can_view_profile,
      can_edit_profile,
      can_view_health_book,
      can_save_location,
      share_expires_at,
      invite_expires_at
    ) VALUES (
      ${params.profileId},
      ${params.ownerUserId},
      ${token},
      ${params.permissions.can_receive_alerts},
      ${params.permissions.can_view_profile},
      ${params.permissions.can_edit_profile},
      ${params.permissions.can_view_health_book},
      ${params.permissions.can_save_location},
      ${params.shareExpiresAt},
      ${inviteExpiresAt}
    )
    RETURNING
      id, profile_id, owner_user_id, token,
      can_receive_alerts, can_view_profile, can_edit_profile,
      can_view_health_book, can_save_location,
      share_expires_at, invite_expires_at,
      redeemed_by_user_id, redeemed_at, revoked_at, created_at
  `;

  return mapInvite(rows[0] as Record<string, unknown>);
}

export async function findProfileShareInviteByToken(
  token: string,
): Promise<ProfileShareInvitePreview | null> {
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    SELECT
      i.id, i.profile_id, i.owner_user_id, i.token,
      i.can_receive_alerts, i.can_view_profile, i.can_edit_profile,
      i.can_view_health_book, i.can_save_location,
      i.share_expires_at, i.invite_expires_at,
      i.redeemed_by_user_id, i.redeemed_at, i.revoked_at, i.created_at,
      qp.beneficiary_name AS profile_name,
      qp.profile_type,
      owner.email AS owner_email,
      owner.full_name AS owner_name
    FROM profile_share_invites i
    JOIN qr_profiles qp ON qp.id = i.profile_id
    JOIN users owner ON owner.id = i.owner_user_id
    WHERE i.token = ${token}
    LIMIT 1
  `;

  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;

  const invite = mapInvite(row);
  return {
    invite,
    profile_name: row.profile_name as string,
    profile_type: row.profile_type as ProfileType,
    owner_email: row.owner_email as string,
    owner_name: (row.owner_name as string | null) ?? null,
  };
}

export function isProfileShareInviteActive(
  invite: Pick<
    ProfileShareInvite,
    "revoked_at" | "redeemed_at" | "invite_expires_at"
  >,
): boolean {
  if (invite.revoked_at || invite.redeemed_at) return false;
  return new Date(invite.invite_expires_at).getTime() > Date.now();
}

export async function redeemProfileShareInvite(params: {
  token: string;
  userId: string;
}): Promise<
  | { ok: true; share: ProfileShare; alreadyAccepted?: boolean }
  | { ok: false; error: string; status: number }
> {
  const preview = await findProfileShareInviteByToken(params.token);
  if (!preview) {
    return { ok: false, error: "Invitación no encontrada", status: 404 };
  }

  const { invite } = preview;

  if (invite.owner_user_id === params.userId) {
    return {
      ok: false,
      error: "No podés aceptar una invitación de tu propio perfil",
      status: 400,
    };
  }

  if (invite.redeemed_at) {
    if (invite.redeemed_by_user_id === params.userId) {
      return { ok: true, share: {} as ProfileShare, alreadyAccepted: true };
    }
    return { ok: false, error: "Esta invitación ya fue usada", status: 410 };
  }

  if (invite.revoked_at) {
    return { ok: false, error: "Esta invitación fue cancelada", status: 410 };
  }

  if (!isProfileShareInviteActive(invite)) {
    return { ok: false, error: "Esta invitación venció", status: 410 };
  }

  const share = await upsertProfileShare({
    profileId: invite.profile_id,
    ownerUserId: invite.owner_user_id,
    sharedWithUserId: params.userId,
    permissions: {
      can_receive_alerts: invite.can_receive_alerts,
      can_view_profile: invite.can_view_profile,
      can_edit_profile: invite.can_edit_profile,
      can_view_health_book: invite.can_view_health_book,
      can_save_location: invite.can_save_location,
    },
    expiresAt: invite.share_expires_at,
  });

  if (!share) {
    return { ok: false, error: "No se pudo completar la invitación", status: 500 };
  }

  const sql = getSql();
  await sql`
    UPDATE profile_share_invites
    SET redeemed_by_user_id = ${params.userId}, redeemed_at = NOW()
    WHERE id = ${invite.id} AND redeemed_at IS NULL
  `;

  return { ok: true, share };
}
