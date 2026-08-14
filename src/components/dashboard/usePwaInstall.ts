"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isIosSafari,
  isMobileDevice,
  isStandaloneDisplay,
} from "@/lib/pwa/device";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function usePwaInstall() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canNativeInstall, setCanNativeInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [iosGuideOpen, setIosGuideOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Guía de instalación iOS solo en Safari real (no Chrome de escritorio).
    setIsIos(isIosSafari());
    setIsMobile(isMobileDevice());
    setIsStandalone(isStandaloneDisplay());

    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setCanNativeInstall(true);
    };

    const onInstalled = () => {
      setCanNativeInstall(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const canInstall =
    isMobile && !isStandalone && (canNativeInstall || isIos);

  const install = useCallback(async () => {
    if (isStandalone) return;

    if (isIos) {
      setIosGuideOpen(true);
      return;
    }

    if (!deferredPrompt) return;

    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setCanNativeInstall(false);
    } finally {
      setInstalling(false);
    }
  }, [deferredPrompt, isIos, isStandalone]);

  return {
    canInstall,
    canNativeInstall,
    isIos,
    isMobile,
    isStandalone,
    iosGuideOpen,
    setIosGuideOpen,
    installing,
    install,
  };
}
