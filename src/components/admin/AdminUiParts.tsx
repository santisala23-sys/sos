import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  adminStatAccents,
  adminUi,
  type AdminStatAccent,
} from "@/components/admin/adminUi";

export function AdminPageHeader({
  eyebrow = "Administración",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={adminUi.pageHeader}>
      <div className={adminUi.pageHeaderGlow} aria-hidden />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={adminUi.pageEyebrow}>{eyebrow}</p>
          <h1 className={adminUi.pageTitle}>{title}</h1>
          {description && <p className={adminUi.pageDescription}>{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </section>
  );
}

export function AdminStatCard({
  label,
  value,
  sub,
  icon,
  accent = "violet",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  accent?: AdminStatAccent;
}) {
  const styles = adminStatAccents[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl",
        styles.card,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-65">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black tabular-nums tracking-tight">{value}</p>
          {sub && <p className="mt-1 text-xs font-medium opacity-70">{sub}</p>}
        </div>
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-105",
            styles.icon,
          )}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

export function AdminSectionCard({
  title,
  subtitle,
  icon,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(adminUi.card, className)}>
      <div className="mb-5 flex items-start gap-3">
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            {icon}
          </span>
        )}
        <div>
          <p className={adminUi.cardTitle}>{title}</p>
          {subtitle && <p className={adminUi.cardSubtitle}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function AdminSubTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon?: ReactNode; badge?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className={adminUi.subTabGroup}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "inline-flex items-center gap-2",
            active === tab.id ? adminUi.subTabActive : adminUi.subTabInactive,
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.badge != null && tab.badge > 0 && active !== tab.id && (
            <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function AdminLoading({ label = "Cargando..." }: { label?: string }) {
  return (
    <p className={adminUi.loading}>
      <Loader2 className="h-4 w-4 animate-spin text-violet-600" aria-hidden />
      {label}
    </p>
  );
}

export function AdminEmptyState({ children }: { children: ReactNode }) {
  return <div className={adminUi.empty}>{children}</div>;
}

export function AdminBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "violet" | "green" | "red" | "amber" | "neutral";
}) {
  const tones = {
    violet: "bg-violet-100 text-violet-800 ring-violet-200",
    green: "bg-green-100 text-green-800 ring-green-200",
    red: "bg-red-100 text-red-800 ring-red-200",
    amber: "bg-amber-100 text-amber-900 ring-amber-200",
    neutral: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function AdminStatusCode({ code }: { code: number }) {
  const tone =
    code >= 500 ? "red" : code >= 400 ? "amber" : "green";

  return (
    <AdminBadge tone={tone}>
      <span className="font-mono">{code}</span>
    </AdminBadge>
  );
}
