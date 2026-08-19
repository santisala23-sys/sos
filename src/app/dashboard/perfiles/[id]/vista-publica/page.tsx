import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { findQrProfileById } from "@/lib/db/queries";
import { findPublicProfileBySlug } from "@/lib/db/public-queries";
import { EmergencyProfileView } from "@/components/public/EmergencyProfileView";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await findQrProfileById(id);

  return {
    title: profile
      ? `Vista previa — ${profile.beneficiary_name}`
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
  const owned = await findQrProfileById(id);
  if (!owned || owned.tutor_id !== session.userId) {
    notFound();
  }

  const profile = await findPublicProfileBySlug(owned.slug, false);
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
