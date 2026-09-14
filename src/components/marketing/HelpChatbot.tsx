"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, MessageCircleQuestion, Send, X } from "lucide-react";
import {
  HELP_SUGGESTED_QUESTIONS,
  bestHelpAnswer,
} from "@/lib/help/search-help";
import {
  buildHelpmeSupportWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/utils/contact";
import { cn } from "@/lib/utils/cn";

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
  offerWhatsApp?: boolean;
  whatsappQuestion?: string;
};

type BotReply = {
  text: string;
  offerWhatsApp?: boolean;
};

const WELCOME =
  "Hola, soy HELPme. Preguntame sobre el panel, los QRs, la libreta sanitaria, co-tutoría o los planes. Respondo con la info de Ayuda.";

function HelpmeBrand({
  compact = false,
  size = "default",
  tone = "dark",
}: {
  compact?: boolean;
  size?: "default" | "teaser";
  tone?: "dark" | "light";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-black leading-none tracking-tight",
        size === "teaser"
          ? "text-lg sm:text-xl"
          : compact
            ? "text-[11px]"
            : "text-sm",
        tone === "dark" ? "text-white" : "text-violet-900",
      )}
    >
      <span>HELP</span>
      <span
        className={cn(
          "font-bold",
          tone === "dark" ? "text-violet-200" : "text-violet-600",
        )}
      >
        me
      </span>
    </span>
  );
}

const TEASER_STORAGE_KEY = "sos_helpme_teaser_dismissed";

function buildBotReply(query: string): BotReply {
  const match = bestHelpAnswer(query);
  if (match) {
    return { text: match.body };
  }

  return {
    text: "No encontré algo exacto sobre eso en Ayuda. Probá con otras palabras — por ejemplo «activar producto», «libreta sanitaria», «co-tutoría» o «plan Pro» — o consultá con nuestro equipo por WhatsApp.",
    offerWhatsApp: true,
  };
}

export function HelpChatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "bot", text: WELCOME },
  ]);
  const [typing, setTyping] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setShowTeaser(sessionStorage.getItem(TEASER_STORAGE_KEY) !== "1");
    } catch {
      setShowTeaser(true);
    }
  }, []);

  const showOnHome = pathname === "/";
  const hideOnPublicProfile = pathname.startsWith("/p/");

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, typing, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!showOnHome || hideOnPublicProfile) return null;

  function pushMessage(
    role: ChatMessage["role"],
    text: string,
    options?: Pick<ChatMessage, "offerWhatsApp" | "whatsappQuestion">,
  ) {
    setMessages((current) => [
      ...current,
      {
        id: `${role}-${Date.now()}-${Math.random()}`,
        role,
        text,
        ...options,
      },
    ]);
  }

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || typing) return;

    pushMessage("user", trimmed);
    setInput("");
    setTyping(true);

    window.setTimeout(() => {
      const reply = buildBotReply(trimmed);
      pushMessage("bot", reply.text, {
        offerWhatsApp: reply.offerWhatsApp,
        whatsappQuestion: reply.offerWhatsApp ? trimmed : undefined,
      });
      setTyping(false);
    }, 350);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    ask(input);
  }

  function dismissTeaser() {
    setShowTeaser(false);
    try {
      sessionStorage.setItem(TEASER_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function openChat() {
    dismissTeaser();
    setOpen(true);
  }

  function closeChat() {
    setOpen(false);
  }

  return (
    <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="flex w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[1.75rem] border border-violet-200/80 bg-white shadow-2xl shadow-violet-500/20"
          role="dialog"
          aria-label="HELPme, asistente de ayuda SOSme"
        >
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-800 px-4 py-3.5 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <HelpmeBrand compact tone="dark" />
              </span>
              <div className="min-w-0">
                <p className="truncate">
                  <HelpmeBrand tone="dark" />
                </p>
                <p className="text-xs text-violet-100">Asistente de ayuda SOSme</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="rounded-xl p-2 text-white/90 transition hover:bg-white/10"
              aria-label="Cerrar asistente"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="max-h-[min(22rem,50vh)] space-y-3 overflow-y-auto bg-gradient-to-b from-violet-50/50 to-white px-3 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col gap-2",
                  message.role === "user" ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                    message.role === "user"
                      ? "rounded-br-md bg-violet-600 text-white"
                      : "rounded-bl-md border border-violet-100 bg-white text-neutral-700",
                  )}
                >
                  {message.text}
                </div>
                {message.offerWhatsApp && (
                  <a
                    href={buildWhatsAppUrl(
                      buildHelpmeSupportWhatsAppMessage(message.whatsappQuestion ?? ""),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-[88%] items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ebe57]"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    Consultar por WhatsApp
                  </a>
                )}
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-violet-100 bg-white px-3.5 py-2.5 text-sm text-neutral-500 shadow-sm">
                  Escribiendo...
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="space-y-2 pt-1">
                <p className="px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">
                  Preguntas frecuentes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {HELP_SUGGESTED_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => ask(question)}
                      className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-left text-xs font-semibold text-violet-800 transition hover:border-violet-300 hover:bg-violet-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-violet-100 bg-white p-3"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Escribí tu pregunta..."
                className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none ring-violet-500 transition focus:border-violet-300 focus:bg-white focus:ring-2"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700 disabled:opacity-50"
                aria-label="Enviar pregunta"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <Link
              href="/ayuda"
              className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Ver ayuda completa
            </Link>
          </form>
        </div>
      )}

      <div className="relative flex flex-col items-end">
        {!open && showTeaser && (
          <div className="pointer-events-none absolute bottom-[calc(100%+0.35rem)] right-0 z-10 w-[min(17rem,calc(100vw-5.5rem))] animate-[helpme-teaser-in_0.45s_ease-out] sm:-translate-x-3">
            <div className="pointer-events-auto relative rounded-2xl border border-violet-100 bg-white px-4 py-3.5 shadow-xl shadow-violet-500/15 ring-1 ring-violet-100/80">
              <button
                type="button"
                onClick={dismissTeaser}
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-violet-100 bg-white text-neutral-400 shadow-sm transition hover:text-neutral-700"
                aria-label="Cerrar mensaje"
              >
                <X className="h-3 w-3" />
              </button>
              <p className="pr-3 text-sm font-black leading-snug text-violet-900">
                ¡Hola! Soy
              </p>
              <p className="mt-1">
                <HelpmeBrand size="teaser" tone="light" />
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                ¿En qué puedo ayudarte?
              </p>
            </div>
            <span
              className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-violet-100 bg-white"
              aria-hidden
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => (open ? closeChat() : openChat())}
          className={cn(
            "relative inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-transform hover:scale-[1.03] active:scale-[0.98]",
            open
              ? "bg-neutral-800 shadow-neutral-900/25"
              : "bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-700 shadow-violet-500/35",
            !open && showTeaser && "animate-[helpme-pulse_2.4s_ease-in-out_infinite]",
          )}
          aria-label={open ? "Cerrar HELPme" : "Abrir HELPme"}
          aria-expanded={open}
        >
          {!open && (
            <span className="absolute inset-0 rounded-full bg-violet-400/30 blur-md" aria-hidden />
          )}
          {open ? (
            <X className="relative h-6 w-6" />
          ) : (
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/25">
              <MessageCircleQuestion className="h-6 w-6" strokeWidth={2.25} />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
