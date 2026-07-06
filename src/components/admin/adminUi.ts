/** Shared light-theme classes for the admin panel */
export const adminUi = {
  page: "space-y-6",
  hero:
    "relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 p-6 text-white shadow-2xl shadow-violet-600/25 sm:p-8",
  heroBadge:
    "inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm",
  card:
    "rounded-[1.75rem] border border-white/90 bg-white/95 p-5 shadow-xl shadow-violet-500/8 backdrop-blur-sm sm:p-6",
  cardTitle: "text-sm font-semibold text-neutral-800",
  tableWrap:
    "overflow-x-auto rounded-2xl border border-violet-100/80 bg-white shadow-lg shadow-violet-500/5",
  tableHead:
    "border-b border-neutral-100 bg-neutral-50/90 text-xs uppercase tracking-wide text-neutral-500",
  tableRow: "hover:bg-violet-50/40 transition-colors",
  tableCell: "px-4 py-3 text-neutral-700",
  input:
    "w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20",
  inputPlain:
    "rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20",
  tabActive:
    "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25",
  tabInactive:
    "border border-violet-100 bg-white text-neutral-600 shadow-sm hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800",
  refreshBtn:
    "flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-violet-200 hover:bg-violet-50",
  editBtn:
    "inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800 transition-colors hover:bg-violet-100",
  loading: "text-sm text-neutral-500",
  subTabActive: "bg-violet-600 text-white shadow-md",
  subTabInactive:
    "bg-white text-neutral-600 border border-neutral-200 hover:bg-violet-50 hover:text-violet-800",
  formCard:
    "rounded-2xl border border-violet-100/80 bg-white p-6 shadow-lg shadow-violet-500/5",
  panelOverlay: "absolute inset-0 bg-neutral-900/40 backdrop-blur-sm",
  panelAside:
    "relative flex h-full w-full max-w-lg flex-col border-l border-violet-100 bg-white shadow-2xl shadow-violet-500/10",
  panelHeader: "flex items-center justify-between border-b border-neutral-100 px-5 py-4",
  panelBody: "flex-1 overflow-y-auto px-5 py-5",
  panelSection:
    "rounded-xl border border-neutral-100 bg-neutral-50/80 p-4 text-sm text-neutral-700",
} as const;

export const adminStatAccents = {
  violet:
    "border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-900 shadow-violet-500/10",
  red: "border-red-200 bg-gradient-to-br from-red-50 to-rose-50 text-red-900 shadow-red-500/10",
  green:
    "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 text-green-900 shadow-green-500/10",
  amber:
    "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-950 shadow-amber-500/10",
  blue: "border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 text-blue-900 shadow-blue-500/10",
  neutral:
    "border-neutral-200 bg-gradient-to-br from-neutral-50 to-slate-50 text-neutral-800 shadow-neutral-500/5",
} as const;
