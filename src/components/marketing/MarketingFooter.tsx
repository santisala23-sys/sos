import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
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

const SITE_LINKS = [
  { href: "/#catalogo", label: "Productos" },
  { href: "/ayuda", label: "Ayuda" },
  { href: "/contacto", label: "Contacto" },
  { href: "/#que-es", label: "Qué es SOSme" },
] as const;

const LEGAL_LINKS = [
  { href: "/terminos", label: "Términos" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/cookies", label: "Cookies" },
  { href: "/aviso-emergencia", label: "Aviso de emergencia" },
] as const;

function FooterColumn({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function FooterList({
  items,
}: {
  items: ReadonlyArray<{ href: string; label: string; external?: boolean }>;
}) {
  return (
    <ul className="space-y-2.5">
      {items.map(({ href, label, external }) => (
        <li key={`${href}-${label}`}>
          {external ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 text-sm text-neutral-700 transition-colors hover:text-violet-700"
            >
              {label}
              <ArrowUpRight
                className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-70"
                aria-hidden
              />
            </a>
          ) : (
            <Link
              href={href}
              className="text-sm text-neutral-700 transition-colors hover:text-violet-700"
            >
              {label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

type MarketingFooterProps = {
  className?: string;
};

export async function MarketingFooter({ className = "" }: MarketingFooterProps) {
  const session = await getSession();
  const activateHref = getActivateCodeHref(Boolean(session));

  const accountLinks = [
    { href: activateHref, label: "Activar producto" },
    ...(!session ? [{ href: "/login", label: "Ingresar" }] : []),
    ...(!session ? [{ href: "/register", label: "Crear cuenta" }] : []),
  ];

  const contactLinks = [
    { href: getContactMailtoUrl(), label: CONTACT_EMAIL, external: false },
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
    <footer className={cn("mt-16 border-t border-violet-200/80 sm:mt-20", className)}>
      <div className="mx-auto max-w-[88rem] px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          <div className="sm:col-span-2 lg:col-span-4 xl:col-span-5">
            <BrandLogo
              size="nav"
              href="/"
              className="h-16 sm:h-[4.5rem] md:h-[5.25rem]"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-600">
              QR de emergencia para personas y mascotas. La alerta llega
              cuando comparten la ubicación, sin apps.
            </p>
            <Link
              href="/#catalogo"
              className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Ver productos
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <FooterColumn title="Sitio" className="lg:col-span-2">
            <FooterList items={[...SITE_LINKS, ...accountLinks]} />
          </FooterColumn>

          <FooterColumn title="Legal" className="lg:col-span-2">
            <FooterList items={LEGAL_LINKS} />
          </FooterColumn>

          <FooterColumn title="Contacto" className="sm:col-span-2 lg:col-span-4 xl:col-span-3">
            <FooterList items={contactLinks} />
            <p className="mt-5 text-xs leading-relaxed text-neutral-500">
              Argentina · respondemos por mail o WhatsApp
            </p>
          </FooterColumn>
        </div>
      </div>

      <div className="border-t border-violet-200/60 bg-neutral-900">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-2 px-4 py-4 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} SOSme</p>
          <p className="text-neutral-600">
            Contacto de emergencia por QR · WhatsApp y alertas incluidas
          </p>
        </div>
      </div>
    </footer>
  );
}
