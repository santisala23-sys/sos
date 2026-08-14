"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type DashboardSectionAccent = "violet" | "rose" | "teal" | "sky";

const ACCENTS: Record<
  DashboardSectionAccent,
  {
    card: string;
    shadow: string;
    icon: string;
    iconShadow: string;
    badge: string;
    chevron: string;
  }
> = {
  violet: {
    card: "border-violet-100/90 bg-gradient-to-br from-white via-white to-violet-50/50",
    shadow: "shadow-violet-500/8",
    icon: "from-violet-600 to-indigo-600",
    iconShadow: "shadow-violet-500/25",
    badge: "bg-violet-100 text-violet-800",
    chevron: "border-violet-100 bg-violet-50/80 text-violet-700",
  },
  /** Personas — landing rose/orange */
  rose: {
    card: "border-rose-100/90 bg-gradient-to-br from-white via-white to-rose-50/60",
    shadow: "shadow-rose-500/10",
    icon: "from-rose-600 to-orange-600",
    iconShadow: "shadow-rose-500/25",
    badge: "bg-rose-100 text-rose-800",
    chevron: "border-rose-100 bg-rose-50/80 text-rose-700",
  },
  /** Mascotas — landing teal/emerald */
  teal: {
    card: "border-teal-100/90 bg-gradient-to-br from-white via-white to-teal-50/60",
    shadow: "shadow-teal-500/10",
    icon: "from-teal-600 to-emerald-700",
    iconShadow: "shadow-teal-500/25",
    badge: "bg-teal-100 text-teal-800",
    chevron: "border-teal-100 bg-teal-50/80 text-teal-700",
  },
  /** Objetos — landing sky/indigo */
  sky: {
    card: "border-sky-100/90 bg-gradient-to-br from-white via-white to-sky-50/60",
    shadow: "shadow-sky-500/10",
    icon: "from-sky-600 to-indigo-700",
    iconShadow: "shadow-sky-500/25",
    badge: "bg-sky-100 text-sky-800",
    chevron: "border-sky-100 bg-sky-50/80 text-sky-700",
  },
};

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
  /** Color alineado a la landing (personas/mascotas/objetos). */
  accent?: DashboardSectionAccent;
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
  accent = "violet",
}: DashboardSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const theme = ACCENTS[accent];

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

  const iconEl = (
    <span
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
        theme.icon,
        theme.iconShadow,
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  );

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-28 rounded-[1.75rem] border p-6 shadow-xl backdrop-blur-sm sm:p-8",
        theme.card,
        theme.shadow,
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
            {iconEl}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl">
                  {title}
                </h2>
                {badge != null && badge !== "" && (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold",
                      theme.badge,
                    )}
                  >
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
                "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-transform",
                theme.chevron,
                open && "rotate-180",
              )}
            >
              <ChevronDown className="h-5 w-5" aria-hidden />
            </span>
          </button>
        ) : (
          <div className="flex min-w-0 items-start gap-4">
            {iconEl}
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
