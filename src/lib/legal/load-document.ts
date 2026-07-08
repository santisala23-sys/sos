import { readFileSync } from "node:fs";
import { join } from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import { getLegalEntitySettings } from "@/lib/db/queries-legal-entity";
import {
  LEGAL_DOCUMENTS,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_VERSION,
  type LegalDocumentSlug,
} from "@/lib/legal/constants";
import { applyLegalVariables, resolveLegalVariables } from "@/lib/legal/entity-settings";

export async function loadLegalDocument(slug: LegalDocumentSlug) {
  noStore();
  const meta = LEGAL_DOCUMENTS[slug];
  const path = join(process.cwd(), "docs/legal", meta.file);
  const rawContent = readFileSync(path, "utf8");
  const settings = await getLegalEntitySettings();
  const content = applyLegalVariables(rawContent, settings);
  const vars = resolveLegalVariables(settings);
  return {
    title: meta.title,
    content,
    version: LEGAL_VERSION,
    effectiveDate: LEGAL_EFFECTIVE_DATE,
    legalName: vars.legal_name,
  };
}
