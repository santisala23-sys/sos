"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type PublicThemeToggleProps = {
  isLight: boolean;
  onToggle: () => void;
  className?: string;
};

export function PublicThemeToggle({
  isLight,
  onToggle,
  className,
}: PublicThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border shadow-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95",
        isLight
          ? "border-neutral-200/80 bg-white/90 text-amber-500 shadow-violet-500/10 hover:bg-white"
          : "border-white/10 bg-neutral-900/70 text-amber-400 shadow-black/30 hover:bg-neutral-800/90",
        className,
      )}
      aria-label={isLight ? "Activar modo oscuro" : "Activar modo claro"}
      title={isLight ? "Modo oscuro" : "Modo claro"}
    >
      {isLight ? (
        <Moon className="h-5 w-5" aria-hidden />
      ) : (
        <Sun className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}
