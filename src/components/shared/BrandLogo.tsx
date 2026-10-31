import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const LOGO_SRC = "/images/brand/sosme-logo-primary.png";
/** Recorte del PNG: icono + “SOSme” sin márgenes violeta extra. */
const LOGO_NAV_SRC = "/images/brand/sosme-logo-nav.png";
const LOGO_NAV_WIDTH = 549;
const LOGO_NAV_HEIGHT = 287;

type BrandLogoProps = {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "nav";
  /** Ignorado: el logo es la imagen de marca. */
  showMark?: boolean;
  /** Ignorado: el logo es la imagen de marca. */
  tone?: "light" | "dark";
};

const imageHeights = {
  sm: "h-8 sm:h-9",
  md: "h-9 sm:h-10",
  lg: "h-12 w-auto max-w-[min(100%,16rem)] sm:h-14",
  nav: "h-14 w-auto max-w-none sm:h-16 md:h-[4.25rem]",
};

export function BrandLogo({
  href = "/",
  className,
  size = "md",
}: BrandLogoProps) {
  const isNav = size === "nav";
  const image = (
    <Image
      src={isNav ? LOGO_NAV_SRC : LOGO_SRC}
      alt="SOSme"
      width={isNav ? LOGO_NAV_WIDTH : 945}
      height={isNav ? LOGO_NAV_HEIGHT : 473}
      priority={size === "lg" || isNav}
      className={cn("object-contain object-left", imageHeights[size], className)}
    />
  );
  const mark = isNav ? (
    <span className="inline-block overflow-hidden rounded-xl">{image}</span>
  ) : (
    image
  );

  if (!href) return mark;

  return (
    <Link href={href} className="inline-flex shrink-0 transition-opacity hover:opacity-85">
      {mark}
    </Link>
  );
}
