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

export const ADMIN_TABS: {
  id: AdminTab;
  label: string;
  icon: ReactNode;
}[] = [
  { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "users", label: "Usuarios", icon: <Users className="h-4 w-4" /> },
  { id: "profiles", label: "Perfiles QR", icon: <QrCode className="h-4 w-4" /> },
  { id: "store", label: "Tienda", icon: <ShoppingBag className="h-4 w-4" /> },
  { id: "templates", label: "Plantillas", icon: <LayoutTemplate className="h-4 w-4" /> },
  { id: "batches", label: "Lotes QR", icon: <Package className="h-4 w-4" /> },
  { id: "activity", label: "Escaneos", icon: <Activity className="h-4 w-4" /> },
  { id: "api", label: "API & Errores", icon: <Server className="h-4 w-4" /> },
  { id: "security", label: "Seguridad", icon: <ShieldAlert className="h-4 w-4" /> },
  { id: "legal", label: "Legal", icon: <FileText className="h-4 w-4" /> },
  { id: "maintenance", label: "Mantenimiento", icon: <Clock className="h-4 w-4" /> },
];

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
    <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Administración">
      {ADMIN_TABS.map((item) => {
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
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
              active
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
                : "text-neutral-600 hover:bg-violet-50 hover:text-violet-800",
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </nav>
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
          "fixed inset-0 z-40 bg-neutral-950/45 transition-opacity duration-150 lg:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => onMobileOpenChange(false)}
      />

      <aside
        id="admin-sidebar"
        className={cn(
          "fixed left-0 top-0 z-50 flex h-[100dvh] w-64 flex-col border-r border-violet-100 bg-white shadow-[4px_0_24px_rgba(91,33,182,0.08)] transition-transform duration-150 ease-out will-change-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          !mobileOpen && "pointer-events-none lg:pointer-events-auto",
        )}
        aria-label="Sidebar de administración"
      >
        <div className="border-b border-violet-100 px-5 py-5">
          <BrandLogo size="md" showMark />
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
            Control Center
          </p>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <SidebarNav
            tab={tab}
            onTabChange={onTabChange}
            onNavigate={() => onMobileOpenChange(false)}
          />
        </div>
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-violet-100 bg-white/95 px-4 py-3 lg:hidden">
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
