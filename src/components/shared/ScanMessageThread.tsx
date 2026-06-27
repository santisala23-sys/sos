"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { ScanMessage } from "@/types/database";
import { formatDateTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

type ScanMessageThreadProps = {
  scanLogId: string;
  slug?: string;
  mode: "public" | "tutor";
  dark?: boolean;
};

export function ScanMessageThread({
  scanLogId,
  slug,
  mode,
  dark = false,
}: ScanMessageThreadProps) {
  const [messages, setMessages] = useState<ScanMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    const url =
      mode === "public" && slug
        ? `/api/scan-logs/${scanLogId}/messages?slug=${encodeURIComponent(slug)}`
        : `/api/scan-logs/${scanLogId}/messages`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages ?? []);
    }
  }, [scanLogId, slug, mode]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!draft.trim()) return;
    setSending(true);
    setError(null);

    const res = await fetch(`/api/scan-logs/${scanLogId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: draft.trim(),
        ...(mode === "public" && slug ? { slug } : {}),
      }),
    });

    if (!res.ok) {
      setError("No se pudo enviar el mensaje.");
      setSending(false);
      return;
    }

    setDraft("");
    setSending(false);
    await loadMessages();
  }

  const containerClass = dark
    ? "border-neutral-700 bg-neutral-900"
    : "border-neutral-200 bg-white";
  const bubblePublic = dark
    ? "bg-neutral-800 text-neutral-100"
    : "bg-neutral-100 text-neutral-900";
  const bubbleTutor = dark
    ? "bg-blue-900 text-blue-50"
    : "bg-blue-100 text-blue-950";

  return (
    <section
      className={`flex flex-col rounded-xl border ${containerClass} overflow-hidden`}
      aria-label="Conversación del evento"
    >
      <div className="border-b border-inherit px-4 py-3">
        <p className={`text-sm font-semibold ${dark ? "text-neutral-200" : "text-neutral-800"}`}>
          Conversación en vivo
        </p>
        <p className={`text-xs ${dark ? "text-neutral-500" : "text-neutral-500"}`}>
          {mode === "public"
            ? "Escribí acá y la familia puede responder desde su panel."
            : "Respondé acá; quien escaneó ve los mensajes al instante."}
        </p>
      </div>

      <div
        className={`flex max-h-64 min-h-[120px] flex-col gap-2 overflow-y-auto px-3 py-3 ${
          dark ? "bg-neutral-950/50" : "bg-neutral-50"
        }`}
      >
        {messages.length === 0 ? (
          <p className={`py-4 text-center text-sm ${dark ? "text-neutral-500" : "text-neutral-400"}`}>
            Todavía no hay mensajes. Escribí el primero.
          </p>
        ) : (
          messages.map((msg) => {
            const isTutor = msg.sender === "tutor";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isTutor ? "items-end" : "items-start"}`}
              >
                <span
                  className={`mb-0.5 text-[10px] font-medium uppercase tracking-wide ${
                    dark ? "text-neutral-500" : "text-neutral-400"
                  }`}
                >
                  {isTutor ? "Familia" : "En el lugar"}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                    isTutor ? bubbleTutor : bubblePublic
                  } ${isTutor ? "rounded-br-md" : "rounded-bl-md"}`}
                >
                  {msg.body}
                </div>
                <span className={`mt-0.5 text-[10px] ${dark ? "text-neutral-600" : "text-neutral-400"}`}>
                  {formatDateTime(msg.created_at)}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className={`flex gap-2 border-t border-inherit p-3 ${dark ? "bg-neutral-900" : "bg-white"}`}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escribí un mensaje..."
          className={`min-w-0 flex-1 rounded-lg border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            dark
              ? "border-neutral-600 bg-neutral-950 text-white placeholder:text-neutral-500"
              : "border-neutral-300 bg-white text-neutral-900"
          }`}
        />
        <Button
          type="button"
          disabled={sending || !draft.trim()}
          onClick={handleSend}
          className="shrink-0 gap-1 px-4"
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      {error && (
        <p className="px-3 pb-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
