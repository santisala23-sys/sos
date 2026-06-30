import { LEGAL_VERSION } from "@/lib/legal/constants";

export type UserLegalRecord = {
  accepted_terms_at: string | null;
  terms_version: string | null;
  privacy_policy_version: string | null;
};

export function needsLegalAcceptance(user: UserLegalRecord | null | undefined): boolean {
  if (!user) return false;
  if (!user.accepted_terms_at || !user.terms_version) return true;
  return user.terms_version !== LEGAL_VERSION;
}

export function getLegalStatus(user: UserLegalRecord | null | undefined) {
  return {
    needsAcceptance: needsLegalAcceptance(user),
    currentVersion: LEGAL_VERSION,
    userVersion: user?.terms_version ?? null,
    acceptedAt: user?.accepted_terms_at ?? null,
  };
}
