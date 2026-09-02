import type { LucideIcon } from "lucide-react";
import { Package, PawPrint, UserCircle2 } from "lucide-react";
import type { ProfileType } from "@/lib/profile-types";

export type ProfileCardTheme = {
  type: ProfileType;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  card: string;
  topBar: string;
  headerGlow: string;
  badge: string;
  avatarRing: string;
  avatarFallback: string;
  contactBox: string;
  contactLabel: string;
  qrPanel: string;
  primaryBtn: string;
  primaryIconWrap: string;
  secondaryBtn: string;
  secondaryIconWrap: string;
  outlineBtn: string;
  outlineIconWrap: string;
  activeOutlineBtn: string;
};

export const PROFILE_CARD_THEMES: Record<ProfileType, ProfileCardTheme> = {
  person: {
    type: "person",
    label: "Persona",
    shortLabel: "Emergencia personal",
    icon: UserCircle2,
    card: "border-rose-200/90 shadow-rose-500/10 hover:shadow-rose-500/20",
    topBar: "bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600",
    headerGlow: "from-rose-100/80 via-white to-pink-50/50",
    badge: "bg-rose-600 text-white shadow-sm shadow-rose-600/30",
    avatarRing: "border-rose-200 ring-rose-100",
    avatarFallback: "bg-rose-100 text-rose-700",
    contactBox: "border-rose-100/80 bg-rose-50/50",
    contactLabel: "text-rose-600/90",
    qrPanel: "border-rose-100 bg-gradient-to-b from-rose-50/80 to-white",
    primaryBtn:
      "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/25 hover:from-rose-700 hover:to-pink-700",
    primaryIconWrap: "bg-white/20 text-white",
    secondaryBtn:
      "border-rose-200/90 bg-white text-rose-900 hover:border-rose-300 hover:bg-rose-50",
    secondaryIconWrap: "bg-rose-100 text-rose-700",
    outlineBtn:
      "border-rose-200/90 bg-rose-50/40 text-rose-800 hover:border-rose-300 hover:bg-rose-50",
    outlineIconWrap: "bg-rose-100/80 text-rose-700",
    activeOutlineBtn:
      "border-rose-400 bg-rose-100 text-rose-900 ring-2 ring-rose-200",
  },
  object: {
    type: "object",
    label: "Objeto",
    shortLabel: "Valija, auto o equipo",
    icon: Package,
    card: "border-sky-200/90 shadow-sky-500/10 hover:shadow-sky-500/20",
    topBar: "bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600",
    headerGlow: "from-sky-100/80 via-white to-blue-50/50",
    badge: "bg-sky-600 text-white shadow-sm shadow-sky-600/30",
    avatarRing: "border-sky-200 ring-sky-100",
    avatarFallback: "bg-sky-100 text-sky-700",
    contactBox: "border-sky-100/80 bg-sky-50/50",
    contactLabel: "text-sky-600/90",
    qrPanel: "border-sky-100 bg-gradient-to-b from-sky-50/80 to-white",
    primaryBtn:
      "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/25 hover:from-sky-700 hover:to-blue-700",
    primaryIconWrap: "bg-white/20 text-white",
    secondaryBtn:
      "border-sky-200/90 bg-white text-sky-900 hover:border-sky-300 hover:bg-sky-50",
    secondaryIconWrap: "bg-sky-100 text-sky-700",
    outlineBtn:
      "border-sky-200/90 bg-sky-50/40 text-sky-800 hover:border-sky-300 hover:bg-sky-50",
    outlineIconWrap: "bg-sky-100/80 text-sky-700",
    activeOutlineBtn:
      "border-sky-400 bg-sky-100 text-sky-900 ring-2 ring-sky-200",
  },
  pet: {
    type: "pet",
    label: "Mascota",
    shortLabel: "Libreta sanitaria",
    icon: PawPrint,
    card: "border-teal-200/90 shadow-teal-500/10 hover:shadow-teal-500/20",
    topBar: "bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600",
    headerGlow: "from-teal-100/80 via-white to-emerald-50/50",
    badge: "bg-teal-600 text-white shadow-sm shadow-teal-600/30",
    avatarRing: "border-teal-200 ring-teal-100",
    avatarFallback: "bg-teal-100 text-teal-700",
    contactBox: "border-teal-100/80 bg-teal-50/50",
    contactLabel: "text-teal-600/90",
    qrPanel: "border-teal-100 bg-gradient-to-b from-teal-50/80 to-white",
    primaryBtn:
      "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/25 hover:from-teal-700 hover:to-emerald-700",
    primaryIconWrap: "bg-white/20 text-white",
    secondaryBtn:
      "border-teal-200/90 bg-white text-teal-900 hover:border-teal-300 hover:bg-teal-50",
    secondaryIconWrap: "bg-teal-100 text-teal-700",
    outlineBtn:
      "border-teal-200/90 bg-teal-50/40 text-teal-800 hover:border-teal-300 hover:bg-teal-50",
    outlineIconWrap: "bg-teal-100/80 text-teal-700",
    activeOutlineBtn:
      "border-teal-400 bg-teal-100 text-teal-900 ring-2 ring-teal-200",
  },
};

export function getProfileCardTheme(
  profileType: string | null | undefined,
): ProfileCardTheme {
  if (profileType === "pet" || profileType === "object") {
    return PROFILE_CARD_THEMES[profileType];
  }
  return PROFILE_CARD_THEMES.person;
}
