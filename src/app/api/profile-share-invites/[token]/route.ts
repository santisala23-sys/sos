import { NextResponse } from "next/server";
import {
  findProfileShareInviteByToken,
  isProfileShareInviteActive,
} from "@/lib/db/queries-profile-share-invites";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { token } = await params;
  const preview = await findProfileShareInviteByToken(token);

  if (!preview) {
    return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });
  }

  const { invite, profile_name, profile_type, owner_email, owner_name } = preview;
  const active = isProfileShareInviteActive(invite);

  return NextResponse.json({
    profileName: profile_name,
    profileType: profile_type,
    ownerName: owner_name,
    ownerEmail: owner_email,
    permissions: {
      can_receive_alerts: invite.can_receive_alerts,
      can_view_profile: invite.can_view_profile,
      can_edit_profile: invite.can_edit_profile,
      can_view_health_book: invite.can_view_health_book,
      can_save_location: invite.can_save_location,
    },
    shareExpiresAt: invite.share_expires_at,
    inviteExpiresAt: invite.invite_expires_at,
    redeemed: Boolean(invite.redeemed_at),
    active,
  });
}
