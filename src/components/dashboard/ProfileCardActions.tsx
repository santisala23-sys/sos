import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const pillBase =
  "group/btn inline-flex items-center gap-2 rounded-xl border-2 px-3.5 py-2.5 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

type CardActionPillProps = {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
  className?: string;
  iconWrapClassName?: string;
  external?: boolean;
  disabled?: boolean;
  active?: boolean;
};

export function CardActionPill({
  href,
  onClick,
  icon: Icon,
  label,
  className,
  iconWrapClassName,
  external = false,
  disabled = false,
  active = false,
}: CardActionPillProps) {
  const baseClass = cn(
    pillBase,
    active && "ring-2 ring-offset-1",
    disabled && "pointer-events-none opacity-60",
    className,
  );

  const content = (
    <>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover/btn:scale-105",
          iconWrapClassName,
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClass}
          aria-label={label}
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={baseClass} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={baseClass}
      aria-label={label}
      aria-pressed={active}
    >
      {content}
    </button>
  );
}

type CardScanAddButtonProps = {
  onClick: () => void;
  className?: string;
};

export function CardScanAddButton({ onClick, className }: CardScanAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Escanear QR para agregar producto"
      title="Escanear QR"
      className={cn(
        "group/add inline-flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:from-amber-500 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/40 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2",
        className,
      )}
    >
      <Plus className="h-6 w-6 transition-transform group-hover/add:scale-110" aria-hidden />
    </button>
  );
}
