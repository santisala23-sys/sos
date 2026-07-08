import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  countActiveQrProfilesByTutor,
  countQrProfilesByTutor,
  findUserLegalStatus,
  findUserPlanById,
} from "@/lib/db/queries";
import { getProfileLimitStatus } from "@/lib/billing/limits";
import { getLegalStatus } from "@/lib/legal/status";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [legal, plan, profileCount, activeProfileCount] = await Promise.all([
    findUserLegalStatus(session.userId),
    findUserPlanById(session.userId),
    countQrProfilesByTutor(session.userId),
    countActiveQrProfilesByTutor(session.userId),
  ]);

  const planRecord = plan ?? { plan_tier: "free", max_profiles: null };

  return NextResponse.json({
    email: session.email,
    legal: getLegalStatus(legal),
    plan: {
      ...getProfileLimitStatus(planRecord, profileCount),
      activeCount: activeProfileCount,
    },
  });
}
