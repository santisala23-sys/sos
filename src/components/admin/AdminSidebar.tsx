"use client";

import type { ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Clock,
  FileText,
  LayoutTemplate,
  Package,
  QrCode,
  Server,
  ShieldAlert,
  ShoppingBag,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { HamburgerButton } from "@/components/shared/HamburgerButton";
import { cn } from "@/lib/utils/cn";

export type AdminTab =
  | "overview"
  | "users"
  | "profiles"
  | "store"
  | "templates"
  | "batches"
  | "activity"
  | "api"
  | "security"
  | "legal"
  | "maintenance";

const NAV_GROUPS: {
  label: string;
  items: { id: AdminTab; label: string; icon: ReactNode }[];
}[] = [
  {
    label: "General",
    items: [
      { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
      { id: "users", label: "Usuarios", icon: <Users className="h-4 w-4" /> },
      { id: "profiles", label: "Perfiles QR", icon: <QrCode className="h-4 w-4" /> },
      { id: "activity", label: "Escaneos", icon: <Activity className="h-4 w-4" /> },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { id: "store", label: "Tienda", icon: <ShoppingBag className="h-4 w-4" /> },
      { id: "templates", label: "Plantillas", icon: <LayoutTemplate className="h-4 w-4" /> },
      { id: "batches", label: "Lotes QR", icon: <Package className="h-4 w-4" /> },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "api", label: "API & Errores", icon: <Server className="h-4 w-4" /> },
      { id: "security", label: "Seguridad", icon: <ShieldAlert className="h-4 w-4" /> },
      { id: "legal", label: "Legal", icon: <FileText className="h-4 w-4" /> },
      { id: "maintenance", label: "Mantenimiento", icon: <Clock className="h-4 w-4" /> },
    ],
  },
];

export const ADMIN_TABS = NAV_GROUPS.flatMap((group) => group.items);

type AdminSidebarProps = {
  tab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

function SidebarNav({
  tab,
  onTabChange,
  onNavigate,
}: {
  tab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-6 px-3 py-4" aria-label="Administración">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300/70">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id);
                    onNavigate?.();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all",
                    active
                      ? "bg-white/15 text-white shadow-inner shadow-white/5 ring-1 ring-white/20"
                      : "text-violet-100/75 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                      active
                        ? "bg-gradient-to-br from-violet-400 to-indigo-500 text-white shadow-md shadow-violet-900/40"
                        : "bg-white/5 text-violet-200",
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarPanel({ children }: { children: ReactNode }) {
  return (
    <aside className="flex h-full w-[17.5rem] flex-col border-r border-violet-900/50 bg-gradient-to-b from-[#1e1145] via-[#251656] to-[#1a1038] text-white shadow-[4px_0_32px_rgba(30,17,69,0.35)]">
      <div className="border-b border-white/10 px-5 py-5">
        <BrandLogo size="md" showMark tone="dark" />
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">
          Panel Administración
        </p>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </aside>
  );
}

export function AdminSidebar({
  tab,
  onTabChange,
  mobileOpen,
  onMobileOpenChange,
}: AdminSidebarProps) {
  return (
    <>
      <button
        type="button"
        aria-hidden={!mobileOpen}
        tabIndex={mobileOpen ? 0 : -1}
        className={cn(
          "fixed inset-0 z-40 bg-neutral-950/55 transition-opacity duration-150 lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => onMobileOpenChange(false)}
      />

      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-[100dvh] transition-transform duration-150 ease-out will-change-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          !mobileOpen && "pointer-events-none lg:pointer-events-auto",
        )}
      >
        <SidebarPanel>
          <SidebarNav
            tab={tab}
            onTabChange={onTabChange}
            onNavigate={() => onMobileOpenChange(false)}
          />
        </SidebarPanel>
      </div>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-violet-200/60 bg-white/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <HamburgerButton
            open={mobileOpen}
            controls="admin-sidebar"
            onClick={() => onMobileOpenChange(!mobileOpen)}
          />
          <span className="text-sm font-bold text-neutral-900">
            {ADMIN_TABS.find((item) => item.id === tab)?.label ?? "Admin"}
          </span>
        </div>
      </div>
    </>
  );
}
