"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { ScanMessage } from "@/types/database";
import { formatDateTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { scannerAuthHeaders } from "@/lib/scan-session/storage";

const POLL_INTERVAL_MS = 6000;
const POLL_INTERVAL_HIDDEN_MS = 20000;
const RATE_LIMIT_BACKOFF_MS = 30000;

type ScanMessageThreadProps = {
  scanLogId: string;
  scanToken?: string;
  slug?: string;
  mode: "public" | "tutor";
  dark?: boolean;
};

export function ScanMessageThread({
  scanLogId,
  scanToken,
  slug,
  mode,
  dark = false,
}: ScanMessageThreadProps) {
  const [messages, setMessages] = useState<ScanMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const shouldStickToBottomRef = useRef(true);
  const pollBackoffUntilRef = useRef(0);

  const loadMessages = useCallback(async () => {
    if (Date.now() < pollBackoffUntilRef.current) return;

    const headers: HeadersInit = {};
    if (mode === "public" && scanToken) {
      headers.Authorization = `Bearer ${scanToken}`;
    }

    const url =
      mode === "public" && slug && !scanToken
        ? `/api/scan-logs/${scanLogId}/messages?slug=${encodeURIComponent(slug)}`
        : `/api/scan-logs/${scanLogId}/messages`;

    const res = await fetch(url, { headers });
    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After"));
      const backoffMs = Number.isFinite(retryAfter)
        ? retryAfter * 1000
        : RATE_LIMIT_BACKOFF_MS;
      pollBackoffUntilRef.current = Date.now() + backoffMs;
      return;
    }

    if (res.ok) {
      const data = await res.json();
      const next = (data.messages ?? []) as ScanMessage[];
      setMessages((prev) => {
        if (
          prev.length === next.length &&
          prev.every((msg, index) => msg.id === next[index]?.id)
        ) {
          return prev;
        }
        return next;
      });
    }
  }, [scanLogId, scanToken, slug, mode]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const hidden = document.visibilityState === "hidden";
      const delay =
        Date.now() < pollBackoffUntilRef.current
          ? Math.max(
              pollBackoffUntilRef.current - Date.now(),
              POLL_INTERVAL_HIDDEN_MS,
            )
          : hidden
            ? POLL_INTERVAL_HIDDEN_MS
            : POLL_INTERVAL_MS;

      timeoutId = setTimeout(async () => {
        if (cancelled) return;
        await loadMessages();
        if (!cancelled) schedule();
      }, delay);
    };

    void loadMessages();
    schedule();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadMessages();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadMessages]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const stick = shouldStickToBottomRef.current;
    const grew = messages.length > prevCountRef.current;
    prevCountRef.current = messages.length;

    if (!stick && !grew) return;

    el.scrollTop = el.scrollHeight;
  }, [messages]);

  function handleListScroll() {
    const el = listRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < 80;
  }

  async function handleSend() {
    if (!draft.trim()) return;
    setSending(true);
    setError(null);

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (mode === "public" && scanToken) {
      Object.assign(headers, scannerAuthHeaders(scanToken));
    }

    const res = await fetch(`/api/scan-logs/${scanLogId}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: draft.trim(),
        ...(mode === "public" && slug && !scanToken ? { slug } : {}),
      }),
    });

    if (!res.ok) {
      let detail = "No se pudo enviar el mensaje.";
      try {
        const data = await res.json();
        if (data.error === "No autorizado") {
          detail =
            "No se pudo enviar. Probá abrir el QR en una ventana privada o cerrá sesión en SOSme.";
        } else if (res.status === 429) {
          detail =
            "Enviaste muchos mensajes seguidos. Esperá un momento e intentá de nuevo.";
        } else if (typeof data.error === "string") {
          detail = data.error;
        }
      } catch {
        /* keep default */
      }
      setError(detail);
      setSending(false);
      return;
    }

    setDraft("");
    setSending(false);
    shouldStickToBottomRef.current = true;
    await loadMessages();
  }

  const containerClass = dark
    ? "border-neutral-700 bg-neutral-900"
    : "border-neutral-200 bg-white";
  const bubblePublic = dark
    ? "bg-neutral-800 text-neutral-100"
    : "bg-neutral-100 text-neutral-900";
  const bubbleTutor = dark
    ? "bg-violet-900 text-violet-50"
    : "bg-violet-100 text-violet-950";

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
        ref={listRef}
        onScroll={handleListScroll}
        className={`flex max-h-64 min-h-[120px] flex-col gap-2 overflow-y-auto overscroll-y-contain px-3 py-3 ${
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
          className={`min-w-0 flex-1 rounded-lg border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-violet-500 ${
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
