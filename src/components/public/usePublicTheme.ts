"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sosme-public-theme";

export type PublicTheme = "dark" | "light";

function readStoredTheme(): PublicTheme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
}

export function usePublicTheme() {
  const [theme, setTheme] = useState<PublicTheme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readStoredTheme());
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: PublicTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const isLight = theme === "light";

  return { theme, isLight, toggle, mounted };
}
