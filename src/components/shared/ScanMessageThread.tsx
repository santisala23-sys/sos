"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Mic, Send, Square } from "lucide-react";
import type { ScanMessage } from "@/types/database";
import { formatDateTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { scannerAuthHeaders } from "@/lib/scan-session/storage";

const POLL_INTERVAL_MS = 6000;
const POLL_INTERVAL_HIDDEN_MS = 20000;
const RATE_LIMIT_BACKOFF_MS = 30000;
const MAX_MEDIA_BYTES = 2 * 1024 * 1024;
const MAX_AUDIO_MS = 60000;

type ScanMessageThreadProps = {
  scanLogId: string;
  scanToken?: string;
  slug?: string;
  mode: "public" | "tutor";
  dark?: boolean;
};

type PendingMedia = {
  type: "image" | "audio";
  mime: string;
  filename: string;
  dataUrl: string;
  base64: string;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("No se pudo leer el archivo"));
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

function mediaSrc(msg: ScanMessage): string | null {
  if (!msg.media_b64 || !msg.media_mime) return null;
  return `data:${msg.media_mime};base64,${msg.media_b64}`;
}

export function ScanMessageThread({
  scanLogId,
  scanToken,
  slug,
  mode,
  dark = false,
}: ScanMessageThreadProps) {
  const [messages, setMessages] = useState<ScanMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pendingMedia, setPendingMedia] = useState<PendingMedia | null>(null);
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
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
          prev.every(
            (msg, index) =>
              msg.id === next[index]?.id &&
              msg.media_b64 === next[index]?.media_b64,
          )
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
    return () => {
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

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

  async function attachImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes.");
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      setError("La imagen supera el máximo de 2 MB.");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const base64 = dataUrl.replace(/^data:[^;]+;base64,/, "");
      setPendingMedia({
        type: "image",
        mime: file.type || "image/jpeg",
        filename: file.name || "foto.jpg",
        dataUrl,
        base64,
      });
      setError(null);
    } catch {
      setError("No se pudo cargar la imagen.");
    }
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await attachImageFile(file);
  }

  function stopRecordingTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function toggleRecording() {
    if (recording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Este dispositivo no permite grabar audio.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        setRecording(false);
        if (recordingTimerRef.current) {
          clearTimeout(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        stopRecordingTracks();

        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        audioChunksRef.current = [];

        if (blob.size === 0) {
          setError("No se capturó audio. Intentá de nuevo.");
          return;
        }
        if (blob.size > MAX_MEDIA_BYTES) {
          setError("El audio supera el máximo de 2 MB.");
          return;
        }

        try {
          const file = new File(
            [blob],
            `audio.${blob.type.includes("mp4") ? "m4a" : "webm"}`,
            { type: blob.type || "audio/webm" },
          );
          const dataUrl = await readFileAsDataUrl(file);
          const base64 = dataUrl.replace(/^data:[^;]+;base64,/, "");
          setPendingMedia({
            type: "audio",
            mime: file.type,
            filename: file.name,
            dataUrl,
            base64,
          });
          setError(null);
        } catch {
          setError("No se pudo preparar el audio.");
        }
      };

      recorder.start();
      setRecording(true);
      setError(null);
      recordingTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, MAX_AUDIO_MS);
    } catch {
      stopRecordingTracks();
      setRecording(false);
      setError("No se pudo acceder al micrófono.");
    }
  }

  async function handleSend() {
    if (!draft.trim() && !pendingMedia) return;
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
        ...(pendingMedia
          ? {
              media: {
                type: pendingMedia.type,
                mime: pendingMedia.mime,
                filename: pendingMedia.filename,
                data: pendingMedia.base64,
              },
            }
          : {}),
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
    setPendingMedia(null);
    setSending(false);
    shouldStickToBottomRef.current = true;
    await loadMessages();
  }

  const canSend = Boolean(draft.trim() || pendingMedia) && !sending && !recording;
  const containerClass = dark
    ? "border-neutral-700 bg-neutral-900"
    : "border-neutral-200 bg-white";
  const bubblePublic = dark
    ? "bg-neutral-800 text-neutral-100"
    : "bg-neutral-100 text-neutral-900";
  const bubbleTutor = dark
    ? "bg-violet-900 text-violet-50"
    : "bg-violet-100 text-violet-950";
  const iconBtnClass = dark
    ? "border-neutral-600 bg-neutral-950 text-neutral-200 hover:bg-neutral-800"
    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50";

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
            ? "Escribí, mandá una foto o un audio. La familia puede responder desde su panel."
            : "Respondé con texto, foto o audio; quien escaneó ve los mensajes al instante."}
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
            const src = mediaSrc(msg);
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
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    isTutor ? bubbleTutor : bubblePublic
                  } ${isTutor ? "rounded-br-md" : "rounded-bl-md"}`}
                >
                  {msg.media_type === "image" && src && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={msg.media_filename || "Foto"}
                      className="mb-1 max-h-48 w-full rounded-lg object-contain"
                    />
                  )}
                  {msg.media_type === "audio" && src && (
                    <audio
                      controls
                      preload="metadata"
                      src={src}
                      className="mb-1 max-w-full"
                    />
                  )}
                  {msg.body ? (
                    <p className="whitespace-pre-wrap">{msg.body}</p>
                  ) : null}
                </div>
                <span className={`mt-0.5 text-[10px] ${dark ? "text-neutral-600" : "text-neutral-400"}`}>
                  {formatDateTime(msg.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {pendingMedia && (
        <div
          className={`flex items-center gap-3 border-t border-inherit px-3 py-2 ${
            dark ? "bg-neutral-950" : "bg-neutral-50"
          }`}
        >
          {pendingMedia.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pendingMedia.dataUrl}
              alt="Vista previa"
              className="h-14 w-14 rounded-lg object-cover"
            />
          ) : (
            <audio controls src={pendingMedia.dataUrl} className="min-w-0 flex-1" />
          )}
          <button
            type="button"
            onClick={() => setPendingMedia(null)}
            className={`shrink-0 text-xs font-medium ${
              dark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Quitar
          </button>
        </div>
      )}

      <div className={`flex items-end gap-2 border-t border-inherit p-3 ${dark ? "bg-neutral-900" : "bg-white"}`}>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <button
          type="button"
          disabled={sending || recording}
          onClick={() => photoInputRef.current?.click()}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${iconBtnClass} disabled:opacity-50`}
          aria-label="Adjuntar foto"
        >
          <ImagePlus className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          disabled={sending}
          onClick={() => void toggleRecording()}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
            recording
              ? "border-red-500 bg-red-600 text-white"
              : iconBtnClass
          } disabled:opacity-50`}
          aria-label={recording ? "Detener grabación" : "Grabar audio"}
        >
          {recording ? (
            <Square className="h-4 w-4" aria-hidden />
          ) : (
            <Mic className="h-4 w-4" aria-hidden />
          )}
        </button>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder={recording ? "Grabando audio..." : "Escribí un mensaje..."}
          disabled={recording}
          className={`min-w-0 flex-1 rounded-lg border px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-violet-500 ${
            dark
              ? "border-neutral-600 bg-neutral-950 text-white placeholder:text-neutral-500"
              : "border-neutral-300 bg-white text-neutral-900"
          }`}
        />
        <Button
          type="button"
          disabled={!canSend}
          onClick={() => void handleSend()}
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
