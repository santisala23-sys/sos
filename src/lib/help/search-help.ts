import { HELP_FAQ, HELP_MANUAL } from "@/lib/help/content";

export type HelpSearchResult = {
  id: string;
  title: string;
  body: string;
  source: "faq" | "manual";
  score: number;
};

const STOP_WORDS = new Set([
  "que",
  "como",
  "cual",
  "cuando",
  "donde",
  "para",
  "por",
  "con",
  "sin",
  "una",
  "uno",
  "del",
  "los",
  "las",
  "sos",
  "sosme",
]);

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/\W+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function scoreMatch(queryTokens: string[], title: string, body: string): number {
  if (queryTokens.length === 0) return 0;

  const titleNorm = normalizeText(title);
  const bodyNorm = normalizeText(body);
  const fullNorm = `${titleNorm} ${bodyNorm}`;
  const queryNorm = queryTokens.join(" ");

  if (titleNorm.includes(queryNorm) || bodyNorm.includes(queryNorm)) {
    return 100 + queryTokens.length * 5;
  }

  let score = 0;
  for (const token of queryTokens) {
    if (titleNorm.includes(token)) score += 8;
    if (bodyNorm.includes(token)) score += 3;
  }

  return score;
}

const KNOWLEDGE_BASE: Omit<HelpSearchResult, "score">[] = [
  ...HELP_FAQ.map((item) => ({
    id: item.id,
    title: item.question,
    body: item.answer,
    source: "faq" as const,
  })),
  ...HELP_MANUAL.flatMap((chapter) =>
    chapter.subsections.map((subsection) => ({
      id: `${chapter.id}-${subsection.id}`,
      title: `${chapter.title.replace(/^\d+\.\s*/, "")} — ${subsection.title}`,
      body: [
        chapter.summary,
        ...subsection.paragraphs,
        ...(subsection.bullets ?? []),
      ].join("\n"),
      source: "manual" as const,
    })),
  ),
];

export const HELP_SUGGESTED_QUESTIONS = HELP_FAQ.slice(0, 6).map((item) => item.question);

export function searchHelp(query: string, limit = 3): HelpSearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const queryTokens = tokenize(trimmed);
  if (queryTokens.length === 0) return [];

  return KNOWLEDGE_BASE.map((entry) => ({
    ...entry,
    score: scoreMatch(queryTokens, entry.title, entry.body),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function bestHelpAnswer(query: string): HelpSearchResult | null {
  const [best] = searchHelp(query, 1);
  return best ?? null;
}
