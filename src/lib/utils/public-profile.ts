import type { PublicQrProfile, QrProfile } from "@/types/database";

export function toPublicProfile(profile: QrProfile): PublicQrProfile {
  const { id: _id, tutor_id: _tutorId, ...publicFields } = profile;
  return publicFields;
}
