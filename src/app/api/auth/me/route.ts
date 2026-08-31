import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  countActiveQrProfilesByTutor,
  countPushSubscriptionsForUser,
  countQrProfilesByTutor,
  findUserAccountById,
  findUserLegalStatus,
  findUserPlanById,
} from "@/lib/db/queries";
import { getProfileLimitStatus } from "@/lib/billing/limits";
import { getLegalStatus } from "@/lib/legal/status";

function resolveAuthMethod(account: {
  google_id: string | null;
  has_password: boolean;
}): "google" | "email" | "google_and_email" {
  if (account.google_id && account.has_password) return "google_and_email";
  if (account.google_id) return "google";
  return "email";
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [
    account,
    legal,
    plan,
    profileCount,
    activeProfileCount,
    pushDeviceCount,
  ] = await Promise.all([
    findUserAccountById(session.userId),
    findUserLegalStatus(session.userId),
    findUserPlanById(session.userId),
    countQrProfilesByTutor(session.userId),
    countActiveQrProfilesByTutor(session.userId),
    countPushSubscriptionsForUser(session.userId),
  ]);

  if (!account) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const planRecord = plan ?? { plan_tier: "free", max_profiles: null };

  return NextResponse.json({
    user: {
      id: account.id,
      email: account.email,
      fullName: account.full_name,
      avatarUrl: account.avatar_url,
      authMethod: resolveAuthMethod(account),
      emailVerified:
        account.email_verified_at != null || session.emailVerified !== false,
      emailVerifiedAt: account.email_verified_at,
      createdAt: account.created_at,
      updatedAt: account.updated_at,
      deletionRequestedAt: account.deletion_requested_at,
    },
    email: session.email,
    emailVerified: session.emailVerified !== false,
    legal: getLegalStatus(legal),
    plan: {
      ...getProfileLimitStatus(planRecord, profileCount),
      activeCount: activeProfileCount,
    },
    pushDeviceCount,
  });
}
