import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { getProfileAccessForUser } from "@/lib/db/queries-profile-shares";
import { findPublicProfileBySlug } from "@/lib/db/public-queries";
import { canViewProfile } from "@/lib/profile-access";
import { EmergencyProfileView } from "@/components/public/EmergencyProfileView";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const session = await getSession();
  const access = session
    ? await getProfileAccessForUser(id, session.userId)
    : null;

  return {
    title: access
      ? `Vista previa — ${access.profile.beneficiary_name}`
      : "Vista previa",
    robots: { index: false, follow: false },
  };
}

export default async function TutorPublicPreviewPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const access = await getProfileAccessForUser(id, session.userId);
  if (!access || !canViewProfile(access)) {
    notFound();
  }

  const profile = await findPublicProfileBySlug(access.profile.slug, false);
  if (!profile) {
    notFound();
  }

  return (
    <EmergencyProfileView
      profile={profile}
      previewMode
    />
  );
}
