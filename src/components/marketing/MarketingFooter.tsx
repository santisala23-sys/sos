import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getActivateCodeHref } from "@/lib/marketing/activate-link";
import {
  CONTACT_EMAIL,
  getContactMailtoUrl,
  getInstagramUrl,
  getTikTokUrl,
  INSTAGRAM_HANDLE,
} from "@/lib/utils/brand";
import { buildWhatsAppUrl } from "@/lib/utils/contact";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/tienda", label: "Productos" },
  { href: "/ayuda", label: "Ayuda" },
  { href: "/contacto", label: "Contacto" },
] as const;

const LEGAL_LINKS = [
  { href: "/terminos", label: "Términos" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/aviso-emergencia", label: "Emergencias" },
] as const;

type FooterLinkItem = {
  href: string;
  label: string;
  external?: boolean;
  emphasize?: boolean;
};

function FooterInlineLinks({
  items,
  className,
  linkClassName,
}: {
  items: FooterLinkItem[];
  className?: string;
  linkClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-y-2",
        className,
      )}
    >
      {items.map((item, index) => {
        const classes = cn(
          "transition-colors duration-200",
          item.emphasize
            ? "font-semibold text-neutral-200 hover:text-white"
            : "text-neutral-400 hover:text-violet-200",
          linkClassName,
        );

        return (
          <span
            key={`${item.href}-${item.label}`}
            className="inline-flex items-center"
          >
            {index > 0 ? (
              <span
                className="mx-3 select-none text-neutral-700 sm:mx-4"
                aria-hidden
              >
                ·
              </span>
            ) : null}
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={classes}
              >
                {item.label}
              </a>
            ) : (
              <Link href={item.href} className={classes}>
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}

type MarketingFooterProps = {
  className?: string;
};

export async function MarketingFooter({ className = "" }: MarketingFooterProps) {
  const session = await getSession();
  const activateHref = getActivateCodeHref(Boolean(session));

  const mainLinks: FooterLinkItem[] = [
    ...NAV_LINKS.map((link) => ({ ...link })),
    { href: activateHref, label: "Activar producto", emphasize: true },
    ...(!session ? [{ href: "/login", label: "Ingresar" }] : []),
  ];

  const contactLinks: FooterLinkItem[] = [
    { href: getContactMailtoUrl(), label: CONTACT_EMAIL },
    {
      href: buildWhatsAppUrl("Hola SOSme"),
      label: "WhatsApp",
      external: true,
    },
    {
      href: getInstagramUrl(),
      label: `@${INSTAGRAM_HANDLE}`,
      external: true,
    },
    { href: getTikTokUrl(), label: "TikTok", external: true },
  ];

  return (
    <footer
      className={cn(
        "relative isolate mt-8 overflow-hidden rounded-t-[1.75rem] bg-neutral-950 sm:mt-10 sm:rounded-t-[2.25rem]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(139,92,246,0.14),transparent_60%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[88rem] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white/90 transition-opacity hover:opacity-80"
          >
            SOSme
          </Link>
          <p className="mt-3 max-w-md text-sm leading-relaxed tracking-wide text-neutral-500">
            Contacto de emergencia por QR
            <span className="text-neutral-600"> · </span>
            alertas al instante
          </p>

          <nav className="mt-9 w-full sm:mt-10" aria-label="Pie de página">
            <FooterInlineLinks
              items={mainLinks}
              linkClassName="text-sm sm:text-[0.9375rem]"
            />
          </nav>

          <div className="mt-8 w-full sm:mt-9">
            <FooterInlineLinks
              items={contactLinks}
              linkClassName="text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-2xl border-t border-white/[0.07] pt-8 sm:mt-14">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-xs text-neutral-600">
              © {new Date().getFullYear()} SOSme · Argentina
            </p>
            <nav aria-label="Legal">
              <FooterInlineLinks
                items={LEGAL_LINKS.map((link) => ({ ...link }))}
                linkClassName="text-xs text-neutral-600 hover:text-neutral-400"
              />
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
