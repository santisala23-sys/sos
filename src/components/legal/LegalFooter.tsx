import Link from "next/link";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LEGAL_FOOTER_LINKS } from "@/lib/legal/constants";

type LegalFooterProps = {
  className?: string;
  compact?: boolean;
  legalName?: string;
};

export function LegalFooter({
  className = "",
  compact = false,
  legalName = "SOSme",
}: LegalFooterProps) {
  return (
    <footer
      className={`border-t border-neutral-200/80 bg-white/80 px-4 py-6 text-center backdrop-blur-sm ${className}`}
    >
      {!compact && (
        <div className="mb-3 flex justify-center">
          <BrandLogo size="sm" />
        </div>
      )}
      <nav
        aria-label="Enlaces legales"
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-neutral-600"
      >
        {LEGAL_FOOTER_LINKS.map((link, index) => (
          <span key={link.href} className="inline-flex items-center gap-3">
            {index > 0 && (
              <span className="text-neutral-300" aria-hidden>
                ·
              </span>
            )}
            <Link
              href={link.href}
              className="underline-offset-2 hover:text-violet-700 hover:underline"
            >
              {link.label}
            </Link>
          </span>
        ))}
      </nav>
      <p className="mt-3 text-xs text-neutral-500">
        © {new Date().getFullYear()} {legalName}. Argentina.
      </p>
    </footer>
  );
}
