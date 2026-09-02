import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type CardActionProps = {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
  className?: string;
  iconWrapClassName?: string;
  external?: boolean;
  disabled?: boolean;
};

export function CardAction({
  href,
  onClick,
  icon: Icon,
  label,
  className,
  iconWrapClassName = "bg-white/20 text-white",
  external = false,
  disabled = false,
}: CardActionProps) {
  const baseClass = cn(
    "group/btn inline-flex min-h-[3rem] w-full items-center justify-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-60",
    className,
  );

  const content = (
    <>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover/btn:scale-105",
          iconWrapClassName,
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="truncate">{label}</span>
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
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={baseClass}>
      {content}
    </button>
  );
}

type CardActionCompactProps = {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
  className?: string;
  iconWrapClassName?: string;
  external?: boolean;
  disabled?: boolean;
};

export function CardActionCompact({
  href,
  onClick,
  icon: Icon,
  label,
  className,
  iconWrapClassName = "bg-current/10",
  external = false,
  disabled = false,
}: CardActionCompactProps) {
  const baseClass = cn(
    "group/btn inline-flex min-h-[3.25rem] flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-3 text-center text-xs font-bold leading-tight transition-all duration-200 sm:text-sm",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-60",
    className,
  );

  const content = (
    <>
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover/btn:scale-105",
          iconWrapClassName,
        )}
      >
        <Icon className="h-[1.125rem] w-[1.125rem]" aria-hidden />
      </span>
      <span>{label}</span>
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
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={baseClass}>
      {content}
    </button>
  );
}
