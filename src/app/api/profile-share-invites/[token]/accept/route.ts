import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { notifyProfileShare } from "@/lib/email/notify-profile-share";
import {
  findProfileShareInviteByToken,
  redeemProfileShareInvite,
} from "@/lib/db/queries-profile-share-invites";

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { token } = await params;
  const result = await redeemProfileShareInvite({
    token,
    userId: session.userId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (!result.alreadyAccepted && result.share) {
    const preview = await findProfileShareInviteByToken(token);
    if (preview) {
      void notifyProfileShare({
        ownerUserId: preview.invite.owner_user_id,
        recipientUserId: session.userId,
        recipientEmail: session.email,
        profileName: preview.profile_name,
        profileType: preview.profile_type,
        permissions: {
          can_receive_alerts: preview.invite.can_receive_alerts,
          can_view_profile: preview.invite.can_view_profile,
          can_edit_profile: preview.invite.can_edit_profile,
          can_view_health_book: preview.invite.can_view_health_book,
          can_save_location: preview.invite.can_save_location,
        },
        expiresAt: preview.invite.share_expires_at,
        isUpdate: false,
      }).catch((error) => {
        console.error("[profile-share-invites accept] email", error);
      });
    }
  }

  return NextResponse.json({
    ok: true,
    alreadyAccepted: result.alreadyAccepted ?? false,
  });
}
