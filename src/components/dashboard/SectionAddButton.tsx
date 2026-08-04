"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SectionAddButtonProps = {
  atLimit: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
};

export function SectionAddButton({
  atLimit,
  disabled = false,
  label,
  onClick,
}: SectionAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={atLimit ? `${label} — límite alcanzado` : label}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition",
        atLimit
          ? "cursor-pointer border-neutral-200 bg-neutral-100 text-neutral-400 opacity-70"
          : "border-violet-200 bg-violet-50 text-violet-700 shadow-sm hover:border-violet-300 hover:bg-violet-100",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      <Plus className="h-5 w-5" aria-hidden />
    </button>
  );
}
