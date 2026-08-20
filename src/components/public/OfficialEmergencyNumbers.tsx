"use client";

import { Phone } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  getOfficialEmergencyNumbers,
  type OfficialEmergencyNumber,
} from "@/lib/emergency-numbers";

type OfficialEmergencyNumbersProps = {
  isLight?: boolean;
  className?: string;
  numbers?: OfficialEmergencyNumber[];
};

export function OfficialEmergencyNumbers({
  isLight = false,
  className,
  numbers = getOfficialEmergencyNumbers(),
}: OfficialEmergencyNumbersProps) {
  return (
    <div
      id="official-emergency-numbers"
      className={cn(
        "rounded-2xl border px-4 py-4",
        isLight
          ? "border-red-200 bg-red-50 text-red-950"
          : "border-red-500/40 bg-red-950/50 text-red-50",
        className,
      )}
      role="region"
      aria-label="Números de emergencia oficiales"
    >
      <p
        className={cn(
          "text-sm font-black uppercase tracking-wide",
          isLight ? "text-red-800" : "text-red-200",
        )}
      >
        Llamá a emergencias ahora
      </p>
      <p
        className={cn(
          "mt-1 text-xs leading-relaxed",
          isLight ? "text-red-800/90" : "text-red-100/80",
        )}
      >
        Números oficiales de Argentina. SOSme ya avisó a la familia; esto no
        reemplaza al 911.
      </p>
      <ul className="mt-3 grid gap-2">
        {numbers.map((item) => (
          <li key={item.dial}>
            <a
              href={`tel:${item.dial}`}
              className={cn(
                "flex min-h-[52px] items-center gap-3 rounded-xl px-3 py-3 font-bold transition-transform active:scale-[0.98]",
                isLight
                  ? "bg-red-600 text-white shadow-md shadow-red-900/20"
                  : "bg-red-600 text-white shadow-lg shadow-red-950/40",
              )}
            >
              <Phone className="h-5 w-5 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-base leading-tight">{item.label}</span>
                <span className="block text-xs font-semibold opacity-90">
                  {item.hint}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
