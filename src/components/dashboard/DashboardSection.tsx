import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type DashboardSectionProps = {
  id?: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

export function DashboardSection({
  id,
  icon: Icon,
  title,
  description,
  children,
  className,
  disabled = false,
}: DashboardSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-28 rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-xl shadow-violet-500/8 backdrop-blur-sm sm:p-8",
        disabled && "pointer-events-none opacity-40",
        className,
      )}
    >
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
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
      {children}
    </section>
  );
}
