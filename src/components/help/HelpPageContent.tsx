"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  HelpCircle,
  MessageCircle,
  Search,
} from "lucide-react";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { Button } from "@/components/ui/Button";
import { HELP_FAQ, HELP_MANUAL } from "@/lib/help/content";
import { cn } from "@/lib/utils/cn";

type HelpPageContentProps = {
  loggedIn?: boolean;
};

type HelpTab = "faq" | "manual";

function FaqAccordion({ query }: { query: string }) {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = HELP_FAQ.filter((item) => {
    if (!normalizedQuery) return true;
    return (
      item.question.toLowerCase().includes(normalizedQuery) ||
      item.answer.toLowerCase().includes(normalizedQuery)
    );
  });

  if (filtered.length === 0) {
    return (
      <p className="rounded-2xl border border-neutral-200 bg-white px-5 py-8 text-center text-neutral-600">
        No encontramos resultados para «{query}». Probá con otra palabra o revisá
        el manual del tutor.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((item) => (
        <details
          key={item.id}
          id={item.id}
          className="group overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm open:shadow-md"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-left font-semibold text-neutral-900 marker:content-none sm:px-6 sm:py-5">
            <span className="pr-2">{item.question}</span>
            <ChevronDown
              className="mt-0.5 h-5 w-5 shrink-0 text-violet-500 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="border-t border-violet-50 px-5 pb-5 pt-4 text-sm leading-relaxed text-neutral-600 sm:px-6 sm:text-base">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

function ManualContent({ query }: { query: string }) {
  const normalizedQuery = query.trim().toLowerCase();

  const chapters = HELP_MANUAL.map((chapter) => {
    if (!normalizedQuery) return chapter;

    const chapterMatches =
      chapter.title.toLowerCase().includes(normalizedQuery) ||
      chapter.summary.toLowerCase().includes(normalizedQuery);

    const filteredSubsections = chapter.subsections.filter((subsection) => {
      const inTitle = subsection.title.toLowerCase().includes(normalizedQuery);
      const inParagraphs = subsection.paragraphs.some((p) =>
        p.toLowerCase().includes(normalizedQuery),
      );
      const inBullets = subsection.bullets?.some((b) =>
        b.toLowerCase().includes(normalizedQuery),
      );
      return inTitle || inParagraphs || inBullets;
    });

    if (chapterMatches) return chapter;
    if (filteredSubsections.length === 0) return null;

    return { ...chapter, subsections: filteredSubsections };
  }).filter(Boolean);

  if (chapters.length === 0) {
    return (
      <p className="rounded-2xl border border-neutral-200 bg-white px-5 py-8 text-center text-neutral-600">
        No encontramos resultados para «{query}» en el manual.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {chapters.map((chapter) =>
        chapter ? (
          <section
            key={chapter.id}
            id={chapter.id}
            className="scroll-mt-32 overflow-hidden rounded-[1.75rem] border border-violet-100 bg-white shadow-lg shadow-violet-500/5"
          >
            <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-6 py-5 sm:px-8">
              <h2 className="text-2xl font-black text-neutral-900">
                {chapter.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base">
                {chapter.summary}
              </p>
            </div>

            <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-8">
              {chapter.subsections.map((subsection) => (
                <div key={subsection.id} id={subsection.id} className="scroll-mt-28">
                  <h3 className="text-lg font-bold text-neutral-900">
                    {subsection.title}
                  </h3>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
                    {subsection.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  {subsection.bullets && subsection.bullets.length > 0 && (
                    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-neutral-700 sm:text-base">
                      {subsection.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <span
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500"
                            aria-hidden
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}

export function HelpPageContent({ loggedIn = false }: HelpPageContentProps) {
  const [tab, setTab] = useState<HelpTab>("faq");
  const [query, setQuery] = useState("");

  return (
    <>
      {!loggedIn && <MarketingNavbar variant="subpage" />}

      <main className="mx-auto max-w-[88rem] px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
            <HelpCircle className="h-4 w-4" aria-hidden />
            Centro de ayuda
          </p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl">
            Ayuda y preguntas frecuentes
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-600">
            Guía completa para configurar tus QRs, entender el panel del tutor y
            usar la libreta sanitaria de tus mascotas.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar en preguntas frecuentes y manual..."
              className="w-full rounded-2xl border border-violet-100 bg-white py-4 pl-12 pr-4 text-base text-neutral-900 shadow-sm outline-none ring-violet-500/20 transition focus:border-violet-300 focus:ring-4"
            />
          </label>
        </div>

        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("faq")}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
              tab === "faq"
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                : "border border-violet-100 bg-white text-neutral-700 hover:bg-violet-50",
            )}
          >
            <CircleHelp className="h-4 w-4" aria-hidden />
            Preguntas frecuentes
          </button>
          <button
            type="button"
            onClick={() => setTab("manual")}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
              tab === "manual"
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                : "border border-violet-100 bg-white text-neutral-700 hover:bg-violet-50",
            )}
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Manual del tutor
          </button>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
              <p className="px-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
                Contenido
              </p>
              <nav className="mt-3 space-y-1" aria-label="Contenido de ayuda">
                <a
                  href="#faq"
                  onClick={() => setTab("faq")}
                  className="block rounded-lg px-2 py-2 text-sm font-medium text-neutral-700 hover:bg-violet-50 hover:text-violet-800"
                >
                  Preguntas frecuentes
                </a>
                <a
                  href="#manual"
                  onClick={() => setTab("manual")}
                  className="block rounded-lg px-2 py-2 text-sm font-medium text-neutral-700 hover:bg-violet-50 hover:text-violet-800"
                >
                  Manual del tutor
                </a>
                {tab === "manual" &&
                  HELP_MANUAL.map((chapter) => (
                    <a
                      key={chapter.id}
                      href={`#${chapter.id}`}
                      className="block rounded-lg px-2 py-2 text-sm text-neutral-600 hover:bg-violet-50 hover:text-violet-800"
                    >
                      {chapter.title}
                    </a>
                  ))}
              </nav>
            </div>
          </aside>

          <div>
            {tab === "faq" ? (
              <section id="faq" className="scroll-mt-28">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-neutral-900">
                    Preguntas frecuentes
                  </h2>
                  <p className="mt-2 text-neutral-600">
                    Respuestas rápidas a las dudas más comunes sobre QRs,
                    libreta sanitaria y el panel.
                  </p>
                </div>
                <FaqAccordion query={query} />
              </section>
            ) : (
              <section id="manual" className="scroll-mt-28">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-neutral-900">
                    Manual del tutor
                  </h2>
                  <p className="mt-2 text-neutral-600">
                    Explicación detallada de cada pantalla, botón y flujo del
                    panel. Ideal para configurar todo desde cero.
                  </p>
                </div>
                <ManualContent query={query} />
              </section>
            )}
          </div>
        </div>

        <section className="mx-auto mt-16 max-w-4xl rounded-[1.75rem] border border-violet-100 bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 px-6 py-10 text-center text-white shadow-2xl shadow-violet-500/25 sm:px-10">
          <MessageCircle className="mx-auto h-8 w-8 text-violet-100" aria-hidden />
          <h2 className="mt-4 text-2xl font-black sm:text-3xl">
            ¿Seguís con dudas?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-violet-100">
            Escribinos y te ayudamos con tu cuenta, la activación de productos o
            la configuración de perfiles.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/contacto">
              <Button
                size="lg"
                className="gap-2 bg-white text-violet-700 hover:bg-violet-50"
              >
                Ir a contacto
                <ExternalLink className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            {loggedIn ? (
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  Volver al panel
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  Iniciar sesión
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
