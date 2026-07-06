import {
  Bell,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  ScanLine,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg" aria-hidden>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-200/50 via-indigo-100/40 to-rose-100/50 blur-2xl" />

      <div className="absolute left-4 top-8 w-[42%] rotate-[-8deg] rounded-2xl border border-white/90 bg-white p-4 shadow-2xl shadow-violet-500/15">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
            <QrCode className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-900">Perfil SOSme</p>
            <p className="text-[10px] text-neutral-500">Emergencia</p>
          </div>
        </div>
        <div className="mt-3 flex aspect-square items-center justify-center rounded-xl bg-neutral-900 p-3">
          <div className="grid grid-cols-5 gap-0.5">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 w-2 rounded-[1px]",
                  [0, 1, 2, 4, 6, 8, 12, 14, 16, 18, 20, 22, 24].includes(i)
                    ? "bg-white"
                    : "bg-white/20",
                )}
              />
            ))}
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] font-medium text-violet-700">
          Escaneá para ayudar
        </p>
      </div>

      <div className="absolute bottom-6 right-0 w-[52%] rotate-[6deg] rounded-[2rem] border-[6px] border-neutral-900 bg-neutral-950 p-2 shadow-2xl shadow-indigo-500/20">
        <div className="overflow-hidden rounded-[1.4rem] bg-gradient-to-b from-violet-50 to-white p-3">
          <div className="flex items-center justify-between text-[9px] text-neutral-500">
            <span>12:34</span>
            <ScanLine className="h-3 w-3 text-violet-600" />
          </div>
          <div className="mt-3 rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
            <p className="text-[10px] font-bold text-neutral-900">
              ¿Necesitás ayuda?
            </p>
            <p className="mt-1 text-[9px] text-neutral-500">
              Contactá al familiar
            </p>
            <div className="mt-2 flex gap-1.5">
              <span className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-500 py-1.5 text-[8px] font-semibold text-white">
                <MessageCircle className="h-2.5 w-2.5" />
                WhatsApp
              </span>
              <span className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-violet-600 py-1.5 text-[8px] font-semibold text-white">
                <Phone className="h-2.5 w-2.5" />
                Llamar
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1.5 text-[8px] text-amber-800">
            <Bell className="h-2.5 w-2.5 shrink-0" />
            Alerta enviada al tutor
          </div>
        </div>
      </div>

      <div className="absolute bottom-[38%] left-[38%] flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg shadow-violet-500/20 ring-4 ring-violet-100">
        <ScanLine className="h-7 w-7 text-violet-600" />
      </div>
    </div>
  );
}

type PhoneMockupProps = {
  step: "scan" | "contact" | "alert";
  className?: string;
};

export function PhoneMockup({ step, className }: PhoneMockupProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[200px] rounded-[1.75rem] border-[5px] border-neutral-900 bg-neutral-950 p-1.5 shadow-xl shadow-violet-500/10",
        className,
      )}
      aria-hidden
    >
      <div className="overflow-hidden rounded-[1.35rem] bg-gradient-to-b from-violet-50 to-white p-3">
        {step === "scan" && (
          <>
            <div className="flex justify-center">
              <div className="rounded-full bg-violet-100 px-3 py-1 text-[9px] font-semibold text-violet-700">
                Cámara abierta
              </div>
            </div>
            <div className="mt-3 flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-violet-300 bg-white">
              <QrCode className="h-10 w-10 text-violet-600" />
            </div>
            <p className="mt-2 text-center text-[9px] text-neutral-600">
              Escaneá el QR
            </p>
            <div className="mt-2 flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-1.5 text-[8px] text-sky-800">
              <MapPin className="h-2.5 w-2.5" />
              Ubicación compartida
            </div>
          </>
        )}

        {step === "contact" && (
          <>
            <p className="text-[10px] font-bold text-neutral-900">
              Perfil de emergencia
            </p>
            <p className="mt-0.5 text-[9px] text-neutral-500">
              María — contacto familiar
            </p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-2 py-2 text-[8px] font-medium text-emerald-800">
                <MessageCircle className="h-3 w-3" />
                Escribir por WhatsApp
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-2 py-2 text-[8px] font-medium text-violet-800">
                <Phone className="h-3 w-3" />
                Llamar ahora
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-sky-50 px-2 py-2 text-[8px] font-medium text-sky-800">
                <MapPin className="h-3 w-3" />
                Ver en el mapa
              </div>
            </div>
          </>
        )}

        {step === "alert" && (
          <>
            <div className="rounded-xl border border-violet-100 bg-white p-2 shadow-sm">
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
                  <Bell className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-neutral-900">
                    Alguien escaneó tu QR
                  </p>
                  <p className="text-[8px] text-neutral-500">Hace 1 minuto</p>
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-xl bg-neutral-900 p-2 text-white">
              <p className="text-[9px] font-semibold">Alerta SOSme</p>
              <p className="mt-1 text-[8px] text-neutral-300">
                Tu perfil fue escaneado. Revisá el mapa y el chat.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
