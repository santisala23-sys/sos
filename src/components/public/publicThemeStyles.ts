import { cn } from "@/lib/utils/cn";

export function publicThemeStyles(isLight: boolean) {
  return {
    page: cn(
      "relative mx-auto min-h-dvh max-w-lg",
      isLight ? "bg-[#f6f4fb] text-neutral-900" : "bg-neutral-950 text-white",
    ),
    headerAssistance: cn(
      "relative border-b px-5 pb-6 pt-10 text-center shadow-lg",
      isLight
        ? "border-violet-200/60 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 text-white shadow-violet-500/20"
        : "border-violet-900/50 bg-gradient-to-br from-violet-800 via-violet-900 to-indigo-950 shadow-violet-950/50",
    ),
    headerSos: cn(
      "relative border-b px-5 pb-6 pt-10 text-center shadow-lg",
      isLight
        ? "border-red-200/60 bg-gradient-to-br from-red-600 via-red-700 to-rose-800 text-white shadow-red-500/20"
        : "border-red-900/50 bg-gradient-to-br from-red-700 via-red-800 to-red-950 shadow-red-950/50",
    ),
    badge: cn(
      "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]",
      isLight
        ? "border-white/30 bg-white/15 text-white"
        : "border-white/20 bg-black/20 text-white/95",
    ),
    strip: cn(
      "border-b px-4 py-3 text-center text-xs leading-relaxed",
      isLight
        ? "border-neutral-200/80 bg-white/70 text-neutral-600"
        : "border-neutral-800/80 bg-neutral-900/90 text-neutral-400",
    ),
    stripStrong: isLight ? "text-neutral-900" : "text-white",
    stripLink: isLight
      ? "font-medium text-violet-700 underline-offset-2 hover:text-violet-900 hover:underline"
      : "font-medium text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline",
    card: cn(
      "overflow-hidden rounded-2xl border shadow-xl",
      isLight
        ? "border-white/90 bg-white/95 shadow-violet-500/10"
        : "border-neutral-800 bg-neutral-900/80 shadow-black/25",
    ),
    cardHeader: cn(
      "border-b px-4 py-3.5",
      isLight ? "border-neutral-100 bg-neutral-50/80" : "border-neutral-800 bg-neutral-900",
    ),
    cardTitle: isLight ? "text-base font-bold text-neutral-900" : "text-base font-bold text-white",
    cardSubtitle: isLight ? "text-xs text-neutral-500" : "text-xs text-neutral-500",
    iconWrapGreen: cn(
      "flex h-9 w-9 items-center justify-center rounded-xl",
      isLight ? "bg-green-100 text-green-700" : "bg-green-600/20 text-green-400",
    ),
    iconWrapViolet: cn(
      "flex h-9 w-9 items-center justify-center rounded-xl",
      isLight ? "bg-violet-100 text-violet-700" : "bg-violet-600/20 text-violet-300",
    ),
    statusSuccess: cn(
      "flex items-start gap-3 rounded-2xl border px-4 py-3.5",
      isLight
        ? "border-green-200 bg-green-50"
        : "border-green-500/30 bg-green-950/50",
    ),
    statusSuccessTitle: isLight ? "font-semibold text-green-900" : "font-semibold text-green-100",
    statusSuccessText: isLight ? "mt-0.5 text-sm text-green-800" : "mt-0.5 text-sm text-green-200/80",
    statusViolet: cn(
      "rounded-2xl border px-4 py-3 text-center text-sm",
      isLight
        ? "border-violet-200 bg-violet-50 text-violet-900"
        : "border-violet-500/30 bg-violet-950/40 text-violet-100",
    ),
    statusLocation: cn(
      "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium",
      isLight ? "bg-neutral-100 text-neutral-600" : "bg-neutral-900/80 text-neutral-400",
    ),
    placeholder: cn(
      "rounded-2xl border border-dashed px-4 py-5 text-center",
      isLight
        ? "border-violet-200 bg-violet-50/50"
        : "border-neutral-700 bg-neutral-900/40",
    ),
    placeholderTitle: isLight ? "mt-2 text-sm font-medium text-neutral-700" : "mt-2 text-sm font-medium text-neutral-400",
    placeholderText: isLight ? "mt-1 text-xs leading-relaxed text-neutral-500" : "mt-1 text-xs leading-relaxed text-neutral-500",
    footer: cn(
      "fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg border-t px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md",
      isLight
        ? "border-red-200/60 bg-white/95 shadow-[0_-8px_30px_rgba(124,58,237,0.08)]"
        : "border-red-900/60 bg-neutral-950/95",
    ),
    footerNote: isLight ? "mb-3 text-center text-xs text-red-700/80" : "mb-3 text-center text-xs text-red-200/80",
    footerNoteStrong: isLight ? "text-red-900" : "text-white",
    footerBrand: isLight ? "text-center text-[11px] text-neutral-400" : "text-center text-[11px] text-neutral-600",
    infoAllergies: cn(
      "rounded-2xl border-2 px-5 py-4 text-lg font-semibold leading-relaxed shadow-md",
      isLight
        ? "border-red-300 bg-red-50 text-red-900 shadow-red-500/10"
        : "border-red-500 bg-red-950 text-red-50 shadow-red-900/20",
    ),
    infoInstructions: cn(
      "rounded-2xl border-2 px-5 py-4 text-lg leading-relaxed shadow-md",
      isLight
        ? "border-amber-300 bg-amber-50 text-amber-950 shadow-amber-500/10"
        : "border-yellow-500 bg-yellow-950 text-yellow-50 shadow-amber-900/20",
    ),
    infoMedical: cn(
      "rounded-2xl border px-4 py-3 text-base shadow-sm",
      isLight
        ? "border-neutral-200 bg-neutral-50 text-neutral-800"
        : "border-neutral-800 bg-neutral-900 text-neutral-200",
    ),
    infoBlood: cn(
      "flex items-center gap-4 rounded-2xl border-2 px-5 py-4 shadow-md",
      isLight
        ? "border-violet-300 bg-violet-50 shadow-violet-500/10"
        : "border-violet-500 bg-violet-950 shadow-violet-900/20",
    ),
    sectionHeadingRed: isLight ? "mb-3 text-lg font-bold uppercase tracking-wide text-red-600" : "mb-3 text-lg font-bold uppercase tracking-wide text-red-400",
    sectionHeadingYellow: isLight ? "mb-3 text-lg font-bold uppercase tracking-wide text-amber-700" : "mb-3 text-lg font-bold uppercase tracking-wide text-yellow-400",
    sectionHeadingMuted: isLight ? "mb-2 text-base font-bold uppercase tracking-wide text-neutral-500" : "mb-2 text-base font-bold uppercase tracking-wide text-neutral-400",
    sectionHeadingViolet: isLight ? "mb-3 text-lg font-bold uppercase tracking-wide text-violet-700" : "mb-3 text-lg font-bold uppercase tracking-wide text-violet-300",
    bloodType: isLight ? "text-3xl font-black tracking-wide text-violet-900 sm:text-4xl" : "text-3xl font-black tracking-wide text-white sm:text-4xl",
    bloodIcon: isLight ? "h-8 w-8 shrink-0 text-violet-600" : "h-8 w-8 shrink-0 text-violet-300",
    pdfButton: cn(
      "flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl border-2 px-4 py-4 text-base font-bold shadow-md transition-transform active:scale-[0.98]",
      isLight
        ? "border-violet-300 bg-violet-50 text-violet-900 hover:bg-violet-100"
        : "border-violet-500 bg-violet-950 text-violet-100",
    ),
    loading: isLight ? "py-8 text-center text-sm text-neutral-500" : "py-8 text-center text-sm text-neutral-400",
    grantedBanner: cn(
      "flex items-center justify-center gap-2 px-4 py-2.5 text-center text-sm font-medium",
      isLight ? "bg-green-50 text-green-800" : "bg-green-900 text-green-100",
    ),
    skippedBanner: cn(
      "px-4 py-2.5 text-center text-sm font-medium",
      isLight ? "bg-amber-50 text-amber-900" : "bg-amber-950 text-amber-100",
    ),
  };
}
