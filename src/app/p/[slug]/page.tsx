import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findQrProfileBySlug } from "@/lib/db/queries";
import { EmergencyProfileView } from "@/components/public/EmergencyProfileView";
import { toPublicProfile } from "@/lib/utils/public-profile";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await findQrProfileBySlug(slug);

  return {
    title: profile
      ? `Asistencia — ${profile.beneficiary_name}`
      : "Perfil SOS",
    description: "Perfil de asistencia y emergencia",
    robots: { index: false, follow: false },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await findQrProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  return <EmergencyProfileView profile={toPublicProfile(profile)} />;
}
