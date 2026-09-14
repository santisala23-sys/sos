import type { Metadata } from "next";
import { MarkdownContent } from "@/components/legal/MarkdownContent";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import {
  LEGAL_DOCUMENTS,
  type LegalDocumentSlug,
} from "@/lib/legal/constants";
import { loadLegalDocument } from "@/lib/legal/load-document";

type LegalPageProps = {
  slug: LegalDocumentSlug;
};

export function legalMetadata(slug: LegalDocumentSlug): Metadata {
  return {
    title: LEGAL_DOCUMENTS[slug].title,
  };
}

export async function LegalPage({ slug }: LegalPageProps) {
  const doc = await loadLegalDocument(slug);

  return (
    <div className="flex min-h-dvh flex-col bg-[#faf9fc]">
      <MarketingNavbar variant="subpage" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <MarkdownContent source={doc.content} />
        <p className="mt-10 border-t border-neutral-200 pt-6 text-sm text-neutral-500">
          Versión {doc.version} · Vigente desde {doc.effectiveDate}
        </p>
      </main>

      <LegalFooter legalName={doc.legalName} />
    </div>
  );
}
