import Link from "next/link";
import type { Metadata } from "next";
import { MarkdownContent } from "@/components/legal/MarkdownContent";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { BrandLogo } from "@/components/shared/BrandLogo";
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

export function LegalPage({ slug }: LegalPageProps) {
  const doc = loadLegalDocument(slug);

  return (
    <div className="flex min-h-dvh flex-col bg-[#faf9fc]">
      <header className="border-b border-neutral-200/80 bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <BrandLogo size="sm" />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-violet-700 hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <MarkdownContent source={doc.content} />
        <p className="mt-10 border-t border-neutral-200 pt-6 text-sm text-neutral-500">
          Versión {doc.version} · Vigente desde {doc.effectiveDate}
        </p>
      </main>

      <LegalFooter />
    </div>
  );
}
