import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findQrProfileBySlug } from "@/lib/db/queries";
import { SosOnlyView } from "@/components/public/SosOnlyView";
import { toPublicProfile } from "@/lib/utils/public-profile";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = {
  title: "SOS Directo",
  robots: { index: false, follow: false },
};

export default async function SosOnlyPage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await findQrProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  return <SosOnlyView profile={toPublicProfile(profile)} />;
}
