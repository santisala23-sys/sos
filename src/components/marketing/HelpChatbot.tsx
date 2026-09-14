"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import {
  HELP_SUGGESTED_QUESTIONS,
  bestHelpAnswer,
} from "@/lib/help/search-help";
import { cn } from "@/lib/utils/cn";

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
};

const WELCOME =
  "Hola, soy el asistente de SOSme. Preguntame sobre el panel, los QRs, la libreta sanitaria, co-tutoría o los planes. Respondo con la info de Ayuda.";

function buildBotReply(query: string): string {
  const match = bestHelpAnswer(query);
  if (match) {
    return match.body;
  }

  return "No encontré algo exacto sobre eso en Ayuda. Probá con otras palabras — por ejemplo «activar producto», «libreta sanitaria», «co-tutoría» o «plan Pro» — o entrá al centro de ayuda completo.";
}

export function HelpChatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "bot", text: WELCOME },
  ]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  function pushMessage(role: ChatMessage["role"], text: string) {
    setMessages((current) => [
      ...current,
      { id: `${role}-${Date.now()}-${Math.random()}`, role, text },
    ]);
  }

  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || typing) return;

    pushMessage("user", trimmed);
    setInput("");
    setTyping(true);

    window.setTimeout(() => {
      pushMessage("bot", buildBotReply(trimmed));
      setTyping(false);
    }, 350);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    ask(input);
  }

  return (
    <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="flex w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[1.75rem] border border-violet-200/80 bg-white shadow-2xl shadow-violet-500/20"
          role="dialog"
          aria-label="Asistente de ayuda SOSme"
        >
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-800 px-4 py-3.5 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <Sparkles className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">Asistente SOSme</p>
                <p className="text-xs text-violet-100">Basado en Ayuda</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
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
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
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

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-transform hover:scale-[1.03] active:scale-[0.98]",
          open
            ? "bg-neutral-800 shadow-neutral-900/25"
            : "bg-gradient-to-br from-violet-600 to-indigo-700 shadow-violet-500/30",
        )}
        aria-label={open ? "Cerrar asistente de ayuda" : "Abrir asistente de ayuda"}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-7 w-7" />}
      </button>
    </div>
  );
}
