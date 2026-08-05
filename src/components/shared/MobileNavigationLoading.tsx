"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

const MOBILE_MQ = "(max-width: 1023px)";
const SHOW_DELAY_MS = 160;
const SAFETY_TIMEOUT_MS = 15000;

function isMobileViewport() {
  return window.matchMedia(MOBILE_MQ).matches;
}

function urlPathChanged(url: string | URL | null | undefined) {
  if (url == null || url === "") return false;

  try {
    const next = new URL(String(url), window.location.href);
    const current = new URL(window.location.href);
    return (
      next.pathname !== current.pathname || next.search !== current.search
    );
  } catch {
    return true;
  }
}

function isInternalNavigation(href: string, pathname: string) {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return false;
  }

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    const current = `${pathname}${window.location.search}`;
    const next = `${url.pathname}${url.search}`;
    return next !== current;
  } catch {
    return false;
  }
}

function MobileNavigationLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);
  const routeKey = `${pathname}?${searchParams.toString()}`;

  function clearTimers() {
    if (showTimerRef.current != null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (safetyTimerRef.current != null) {
      window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }

  function stopPending() {
    clearTimers();
    setVisible(false);
  }

  function startPending() {
    if (!isMobileViewport()) return;

    clearTimers();
    showTimerRef.current = window.setTimeout(() => {
      setVisible(true);
      safetyTimerRef.current = window.setTimeout(() => {
        setVisible(false);
      }, SAFETY_TIMEOUT_MS);
    }, SHOW_DELAY_MS);
  }

  useEffect(() => {
    stopPending();
  }, [routeKey]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!isMobileViewport() || event.defaultPrevented) return;

      const anchor = (event.target as Element | null)?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (!isInternalNavigation(anchor.getAttribute("href") ?? "", pathname)) return;

      startPending();
    }

    function handlePopState() {
      if (!isMobileViewport()) return;
      startPending();
    }

    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (state, unused, url) => {
      if (isMobileViewport() && urlPathChanged(url)) startPending();
      return originalPushState(state, unused, url);
    };

    history.replaceState = (state, unused, url) => {
      if (isMobileViewport() && urlPathChanged(url)) startPending();
      return originalReplaceState(state, unused, url);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      clearTimers();
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center lg:hidden"
      role="status"
      aria-live="polite"
      aria-label="Procesando"
    >
      <div
        className="absolute inset-0 bg-white/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/45"
        aria-hidden
      />
      <div className="relative mx-4 flex max-w-xs flex-col items-center gap-3 rounded-3xl border border-white/90 bg-white/95 px-8 py-7 text-center shadow-2xl shadow-violet-500/20">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30">
          <Loader2 className="h-7 w-7 animate-spin" aria-hidden />
        </span>
        <div>
          <p className="text-lg font-black tracking-tight text-neutral-900">
            Procesando
          </p>
          <p className="mt-1 text-sm text-neutral-500">Un momento…</p>
        </div>
      </div>
    </div>
  );
}

export function MobileNavigationLoading() {
  return (
    <Suspense fallback={null}>
      <MobileNavigationLoadingOverlay />
    </Suspense>
  );
}
