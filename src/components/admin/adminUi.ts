/** Shared design tokens for the admin panel */
export const adminUi = {
  page: "space-y-6",
  shell: "min-h-screen lg:pl-[17.5rem]",
  main: "mx-auto max-w-[88rem] px-4 py-5 sm:px-6 lg:px-8 lg:py-8",

  pageHeader:
    "relative overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-5 shadow-lg shadow-violet-500/5 backdrop-blur-sm sm:p-6",
  pageHeaderGlow:
    "pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-400/15 blur-2xl",
  pageEyebrow:
    "text-[11px] font-bold uppercase tracking-[0.22em] text-violet-600",
  pageTitle: "mt-2 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl",
  pageDescription: "mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base",

  toolbar:
    "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm",
  card:
    "rounded-2xl border border-white/90 bg-white/95 p-5 shadow-lg shadow-violet-500/5 backdrop-blur-sm sm:p-6",
  cardTitle: "text-sm font-bold text-neutral-900",
  cardSubtitle: "mt-1 text-sm text-neutral-500",
  sectionTitle: "text-base font-bold text-neutral-900",

  tableWrap:
    "overflow-hidden overflow-x-auto rounded-2xl border border-violet-100/70 bg-white shadow-lg shadow-violet-500/5",
  tableHead:
    "border-b border-neutral-100 bg-gradient-to-b from-neutral-50 to-white text-[11px] uppercase tracking-[0.14em] text-neutral-500",
  tableRow: "transition-colors hover:bg-violet-50/50",
  tableCell: "px-4 py-3.5 text-sm text-neutral-700",

  input:
    "w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/15",
  inputPlain:
    "rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/15",
  label: "block text-sm font-medium text-neutral-700",

  subTabGroup:
    "inline-flex flex-wrap gap-1 rounded-2xl border border-violet-100 bg-white p-1 shadow-sm",
  subTabActive:
    "rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20",
  subTabInactive:
    "rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-violet-50 hover:text-violet-800",

  refreshBtn:
    "inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800 active:scale-[0.98]",
  primaryBtn:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition-all hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-60",
  secondaryBtn:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition-all hover:border-violet-200 hover:bg-violet-50 active:scale-[0.98]",
  editBtn:
    "inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800 transition-colors hover:border-violet-300 hover:bg-violet-100",

  loading: "flex items-center gap-2 text-sm text-neutral-500",
  empty: "rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 px-6 py-12 text-center text-sm text-neutral-500",

  alertError:
    "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800",
  alertSuccess:
    "rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800",
  alertWarning:
    "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900",

  panelOverlay: "absolute inset-0 bg-neutral-900/50 backdrop-blur-[2px]",
  panelAside:
    "relative flex h-full w-full max-w-lg flex-col border-l border-violet-100 bg-white shadow-2xl shadow-violet-900/10",
  panelHeader:
    "flex items-center justify-between border-b border-neutral-100 bg-gradient-to-r from-violet-50/80 to-white px-5 py-4",
  panelBody: "flex-1 overflow-y-auto px-5 py-5",
  panelSection:
    "rounded-xl border border-neutral-100 bg-neutral-50/90 p-4 text-sm text-neutral-700",
  formCard:
    "rounded-2xl border border-violet-100/80 bg-white p-6 shadow-lg shadow-violet-500/5",
} as const;

export const adminStatAccents = {
  violet: {
    card: "border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-indigo-50/80 text-violet-950 shadow-violet-500/10",
    icon: "bg-violet-600 text-white shadow-violet-500/30",
  },
  red: {
    card: "border-red-200/80 bg-gradient-to-br from-red-50 via-white to-rose-50/80 text-red-950 shadow-red-500/10",
    icon: "bg-red-600 text-white shadow-red-500/30",
  },
  green: {
    card: "border-green-200/80 bg-gradient-to-br from-green-50 via-white to-emerald-50/80 text-green-950 shadow-green-500/10",
    icon: "bg-emerald-600 text-white shadow-emerald-500/30",
  },
  amber: {
    card: "border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50/80 text-amber-950 shadow-amber-500/10",
    icon: "bg-amber-500 text-white shadow-amber-500/30",
  },
  blue: {
    card: "border-blue-200/80 bg-gradient-to-br from-blue-50 via-white to-sky-50/80 text-blue-950 shadow-blue-500/10",
    icon: "bg-blue-600 text-white shadow-blue-500/30",
  },
  neutral: {
    card: "border-neutral-200/80 bg-gradient-to-br from-neutral-50 via-white to-slate-50/80 text-neutral-900 shadow-neutral-500/5",
    icon: "bg-neutral-700 text-white shadow-neutral-500/20",
  },
} as const;

export type AdminStatAccent = keyof typeof adminStatAccents;
