"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type DashboardSectionProps = {
  id?: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  /** Si true, el contenido (tarjetas) se muestra al desplegar. */
  collapsible?: boolean;
  /** Estado inicial cuando es desplegable. */
  defaultOpen?: boolean;
  /** Contador opcional (ej. cantidad de perfiles). */
  badge?: string | number;
  /** Texto cuando está cerrado y hay contenido. */
  closedHint?: string;
};

export function DashboardSection({
  id,
  icon: Icon,
  title,
  description,
  headerAction,
  children,
  className,
  disabled = false,
  collapsible = false,
  defaultOpen = false,
  badge,
  closedHint,
}: DashboardSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!collapsible || !id) return;
    function syncFromHash() {
      if (window.location.hash === `#${id}`) {
        setOpen(true);
      }
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [collapsible, id]);

  const showChildren = !collapsible || open;

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-28 rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-xl shadow-violet-500/8 backdrop-blur-sm sm:p-8",
        disabled && "pointer-events-none opacity-40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="flex min-w-0 flex-1 items-start gap-4 text-left"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl">
                  {title}
                </h2>
                {badge != null && badge !== "" && (
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-800">
                    {badge}
                  </span>
                )}
              </div>
              {description && (
                <p className="mt-1 text-sm leading-relaxed text-neutral-600 sm:text-base">
                  {description}
                </p>
              )}
              {!open && closedHint ? (
                <p className="mt-2 text-xs text-neutral-500">{closedHint}</p>
              ) : null}
            </div>
            <span
              className={cn(
                "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600 transition-transform",
                open && "rotate-180",
              )}
            >
              <ChevronDown className="h-5 w-5" aria-hidden />
            </span>
          </button>
        ) : (
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl">
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-sm leading-relaxed text-neutral-600 sm:text-base">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}
        {headerAction ? (
          <div
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {headerAction}
          </div>
        ) : null}
      </div>
      {showChildren ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
