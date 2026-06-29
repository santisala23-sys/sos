import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type BrandLogoProps = {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-3xl sm:text-4xl",
};

export function BrandLogo({
  href = "/",
  className,
  size = "md",
}: BrandLogoProps) {
  const mark = (
    <span
      className={cn(
        "inline-flex items-baseline font-black tracking-tight",
        sizes[size],
        className,
      )}
    >
      <span className="text-neutral-900">SOS</span>
      <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
        me
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
