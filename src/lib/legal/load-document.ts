import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  LEGAL_DOCUMENTS,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_VERSION,
  type LegalDocumentSlug,
} from "@/lib/legal/constants";

export function loadLegalDocument(slug: LegalDocumentSlug) {
  const meta = LEGAL_DOCUMENTS[slug];
  const path = join(process.cwd(), "docs/legal", meta.file);
  const content = readFileSync(path, "utf8");
  return {
    title: meta.title,
    content,
    version: LEGAL_VERSION,
    effectiveDate: LEGAL_EFFECTIVE_DATE,
  };
}
