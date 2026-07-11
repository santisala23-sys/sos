"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { HamburgerButton } from "@/components/shared/HamburgerButton";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  id: string;
  title?: string;
  hiddenFrom?: "lg" | "xl";
  children: ReactNode;
};

const hiddenClass = {
  lg: "lg:hidden",
  xl: "xl:hidden",
} as const;

export function MobileNavDrawer({
  open,
  onClose,
  id,
  title = "Menú",
  hiddenFrom = "xl",
  children,
}: MobileNavDrawerProps) {
  const hide = hiddenClass[hiddenFrom];

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        className={cn(
          "fixed inset-0 z-40 bg-neutral-950/45 transition-opacity duration-150",
          hide,
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        id={id}
        aria-hidden={!open}
        inert={open ? undefined : true}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-[100dvh] w-[min(100vw,19.5rem)] flex-col bg-white shadow-[-12px_0_40px_rgba(91,33,182,0.12)] transition-transform duration-150 ease-out will-change-transform",
          hide,
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-violet-100 bg-gradient-to-r from-violet-50/80 to-white px-5 py-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
            {title}
          </span>
          <HamburgerButton open onClick={onClose} aria-label="Cerrar menú" />
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">{children}</div>
      </aside>
    </>
  );
}
