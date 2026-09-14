import type { ProfileShare, QrProfile } from "@/types/database";

export const MAX_PROFILE_SHARES = 4;

export type ProfileAccess =
  | { kind: "owner"; profile: QrProfile }
  | { kind: "shared"; profile: QrProfile; share: ProfileShare };

export function isShareActive(share: Pick<ProfileShare, "revoked_at" | "expires_at">): boolean {
  if (share.revoked_at) return false;
  if (!share.expires_at) return true;
  return new Date(share.expires_at).getTime() > Date.now();
}

export function canReceiveAlerts(access: ProfileAccess): boolean {
  if (access.kind === "owner") return true;
  return access.share.can_receive_alerts && isShareActive(access.share);
}

export function canViewProfile(access: ProfileAccess): boolean {
  if (access.kind === "owner") return true;
  return (
    isShareActive(access.share) &&
    (access.share.can_view_profile || access.share.can_edit_profile)
  );
}

/** Acceso al panel del perfil (detalle, libreta, etc.). */
export function canAccessProfileDashboard(access: ProfileAccess): boolean {
  if (access.kind === "owner") return true;
  if (!isShareActive(access.share)) return false;
  const share = access.share;
  return (
    share.can_view_profile ||
    share.can_edit_profile ||
    share.can_view_health_book ||
    share.can_save_location
  );
}

export function canEditProfile(access: ProfileAccess): boolean {
  if (access.kind === "owner") return true;
  return isShareActive(access.share) && access.share.can_edit_profile;
}

export function canViewHealthBook(access: ProfileAccess): boolean {
  if (access.kind === "owner") return true;
  return (
    isShareActive(access.share) &&
    (access.share.can_view_health_book || access.share.can_edit_profile)
  );
}

export function canSaveLocation(access: ProfileAccess): boolean {
  if (access.kind === "owner") return true;
  return isShareActive(access.share) && access.share.can_save_location;
}

export function canDeleteProfile(access: ProfileAccess): boolean {
  return access.kind === "owner";
}

export function canManageShares(access: ProfileAccess): boolean {
  return access.kind === "owner";
}

export type ProfileSharePermissionsInput = Pick<
  ProfileShare,
  | "can_receive_alerts"
  | "can_view_profile"
  | "can_edit_profile"
  | "can_view_health_book"
  | "can_save_location"
>;

export const DEFAULT_SHARE_PERMISSIONS: ProfileSharePermissionsInput = {
  can_receive_alerts: true,
  can_view_profile: false,
  can_edit_profile: false,
  can_view_health_book: false,
  can_save_location: false,
};

export function normalizeSharePermissions(
  input: Partial<ProfileSharePermissionsInput> | undefined,
): ProfileSharePermissionsInput {
  return {
    can_receive_alerts: input?.can_receive_alerts ?? DEFAULT_SHARE_PERMISSIONS.can_receive_alerts,
    can_view_profile: input?.can_view_profile ?? DEFAULT_SHARE_PERMISSIONS.can_view_profile,
    can_edit_profile: input?.can_edit_profile ?? DEFAULT_SHARE_PERMISSIONS.can_edit_profile,
    can_view_health_book:
      input?.can_view_health_book ?? DEFAULT_SHARE_PERMISSIONS.can_view_health_book,
    can_save_location: input?.can_save_location ?? DEFAULT_SHARE_PERMISSIONS.can_save_location,
  };
}

export function hasAnySharePermission(permissions: ProfileSharePermissionsInput): boolean {
  return Object.values(permissions).some(Boolean);
}
