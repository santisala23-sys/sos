import Link from "next/link";
import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type BrandLogoProps = {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showMark?: boolean;
  tone?: "light" | "dark";
};

const sizes = {
  sm: { text: "text-lg", icon: "h-7 w-7", iconInner: "h-3.5 w-3.5" },
  md: { text: "text-xl", icon: "h-8 w-8", iconInner: "h-4 w-4" },
  lg: { text: "text-3xl sm:text-4xl", icon: "h-11 w-11", iconInner: "h-5 w-5" },
};

export function BrandLogo({
  href = "/",
  className,
  size = "md",
  showMark = false,
  tone = "light",
}: BrandLogoProps) {
  const mark = (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-black tracking-tight",
        sizes[size].text,
        className,
      )}
    >
      {showMark && (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25",
            sizes[size].icon,
          )}
        >
          <QrCode className={sizes[size].iconInner} aria-hidden />
        </span>
      )}
      <span className="inline-flex items-baseline">
        <span className={tone === "dark" ? "text-white" : "text-neutral-900"}>SOS</span>
        <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          me
        </span>
      </span>
    </span>
  );

  if (!href) return mark;

  return (
    <Link href={href} className="transition-opacity hover:opacity-80">
      {mark}
    </Link>
  );
}
