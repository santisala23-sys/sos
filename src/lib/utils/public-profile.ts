import type { PublicQrProfile, QrProfile } from "@/types/database";

export function toPublicProfile(profile: QrProfile): PublicQrProfile {
  const {
    id: _id,
    tutor_id: _tutorId,
    saved_latitude: _savedLat,
    saved_longitude: _savedLng,
    saved_location_at: _savedAt,
    ...publicFields
  } = profile;
  return publicFields;
}
