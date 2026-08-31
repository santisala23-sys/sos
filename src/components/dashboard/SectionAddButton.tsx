"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SectionAddButtonProps = {
  disabled?: boolean;
  label: string;
  onClick: () => void;
};

export function SectionAddButton({
  disabled = false,
  label,
  onClick,
}: SectionAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-violet-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-100",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      <Plus className="h-5 w-5" aria-hidden />
    </button>
  );
}
