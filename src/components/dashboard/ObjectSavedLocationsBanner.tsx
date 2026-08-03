import type { QrProfile } from "@/types/database";
import { SavedLocationPanel } from "@/components/dashboard/SavedLocationPanel";

type ObjectSavedLocationsBannerProps = {
  profiles: QrProfile[];
};

function hasSavedLocation(profile: QrProfile): boolean {
  return (
    profile.profile_type === "object" &&
    profile.saved_latitude != null &&
    profile.saved_longitude != null &&
    profile.saved_location_at != null
  );
}

export function ObjectSavedLocationsBanner({
  profiles,
}: ObjectSavedLocationsBannerProps) {
  const objectLocations = profiles
    .filter(hasSavedLocation)
    .sort(
      (a, b) =>
        new Date(b.saved_location_at!).getTime() -
        new Date(a.saved_location_at!).getTime(),
    );

  if (objectLocations.length === 0) return null;

  return (
    <section className="space-y-3" aria-label="Ubicaciones guardadas de objetos">
      {objectLocations.map((profile) => (
        <SavedLocationPanel
          key={profile.id}
          variant="banner"
          beneficiaryName={profile.beneficiary_name}
          latitude={Number(profile.saved_latitude)}
          longitude={Number(profile.saved_longitude)}
          savedAt={profile.saved_location_at!}
          profileHref={`/dashboard/perfiles/${profile.id}`}
        />
      ))}
    </section>
  );
}
