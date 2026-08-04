import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { findQrProfileById } from "@/lib/db/queries";
import { EmergencyProfileView } from "@/components/public/EmergencyProfileView";
import { toPublicProfile } from "@/lib/utils/public-profile";

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
  const profile = await findQrProfileById(id);
  if (!profile || profile.tutor_id !== session.userId) {
    notFound();
  }

  return (
    <EmergencyProfileView
      profile={toPublicProfile(profile)}
      previewMode
    />
  );
}
