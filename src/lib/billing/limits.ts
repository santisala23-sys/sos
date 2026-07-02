import { PLANS, type PlanTier } from "@/lib/billing/plans";

export type UserPlanRecord = {
  plan_tier: PlanTier | string;
  max_profiles: number | null;
};

export function resolveMaxProfiles(user: UserPlanRecord): number {
  if (user.max_profiles != null && user.max_profiles > 0) {
    return user.max_profiles;
  }

  const tier = user.plan_tier as PlanTier;
  if (tier in PLANS) {
    return PLANS[tier].maxProfiles;
  }

  return PLANS.free.maxProfiles;
}

export function getProfileLimitStatus(
  user: UserPlanRecord,
  currentCount: number,
) {
  const maxProfiles = resolveMaxProfiles(user);
  const canCreateMore = currentCount < maxProfiles;

  return {
    planTier: (user.plan_tier in PLANS ? user.plan_tier : "free") as PlanTier,
    planName: PLANS[user.plan_tier as PlanTier]?.name ?? PLANS.free.name,
    maxProfiles,
    currentCount,
    canCreateMore,
    remaining: Math.max(0, maxProfiles - currentCount),
  };
}
