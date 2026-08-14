export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS reciente puede reportarse como Macintosh con touch.
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
}

/**
 * Safari/WebKit real en iPhone/iPad.
 * `navigator.standalone` solo existe ahí; Chrome/Firefox de escritorio
 * (aunque emulen UA de iPhone) no lo definen.
 */
export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    typeof (navigator as Navigator & { standalone?: boolean }).standalone ===
    "boolean"
  );
}

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return true;
  }

  // iPad con iOS reciente puede reportar Macintosh en el user agent.
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) {
    return true;
  }

  return false;
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}
