import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Mail,
  MapPin,
  MessageCircle,
  QrCode,
  Shield,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";
import { LEGAL_FOOTER_LINKS } from "@/lib/legal/constants";

const PRODUCT_LINKS = [
  { href: "/#que-es", label: "Qué es SOSme" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#casos", label: "Casos de uso" },
  { href: "/#demo", label: "Demo en video" },
  { href: "/tienda", label: "Tienda" },
  { href: "/pricing", label: "Planes" },
] as const;

const ACCOUNT_LINKS = [
  { href: "/register", label: "Crear cuenta gratis" },
  { href: "/login", label: "Iniciar sesión" },
  { href: "/activar", label: "Activar código" },
  { href: "/contacto", label: "Contacto" },
] as const;

const LEGAL_LINKS = LEGAL_FOOTER_LINKS.filter((l) =>
  ["/terminos", "/privacidad", "/cookies", "/retencion-datos", "/aviso-emergencia"].includes(
    l.href,
  ),
);

const TRUST_ITEMS = [
  { icon: QrCode, text: "Sin instalar apps" },
  { icon: Bell, text: "Alertas al instante" },
  { icon: Shield, text: "Datos protegidos" },
] as const;

type MarketingFooterProps = {
  className?: string;
};

export function MarketingFooter({ className = "" }: MarketingFooterProps) {
  return (
    <footer className={`border-t border-violet-100/80 bg-neutral-950 text-neutral-300 ${className}`}>
      <div className="mx-auto max-w-[88rem] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <BrandLogo
              size="lg"
              showMark
              href=""
              className="[&_.text-neutral-900]:text-white"
            />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-400">
              SOSme vincula un código QR a tu perfil de emergencia. Quien lo escanea
              sabe cómo contactarte y vos recibís la alerta al instante.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {TRUST_ITEMS.map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300"
                >
                  <Icon className="h-3.5 w-3.5 text-violet-400" aria-hidden />
                  {text}
                </span>
              ))}
            </div>
            <Link href="/register" className="mt-8 inline-block">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30 hover:from-violet-700 hover:to-indigo-700"
              >
                Crear perfil gratis
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Producto
              </h3>
              <ul className="mt-4 space-y-2.5">
                {PRODUCT_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-neutral-400 transition-colors hover:text-violet-300"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Cuenta
              </h3>
              <ul className="mt-4 space-y-2.5">
                {ACCOUNT_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-neutral-400 transition-colors hover:text-violet-300"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Legal
              </h3>
              <ul className="mt-4 space-y-2.5">
                {LEGAL_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-neutral-400 transition-colors hover:text-violet-300"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-white/10 bg-white/5 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="font-semibold text-white">¿Necesitás ayuda?</p>
            <p className="mt-1 text-sm text-neutral-400">
              Escribinos por contacto o activá un producto que ya compraste.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
            <Link href="/contacto">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/15"
              >
                <Mail className="h-4 w-4" aria-hidden />
                Contacto
              </Button>
            </Link>
            <Link href="/activar">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/15"
              >
                <QrCode className="h-4 w-4" aria-hidden />
                Activar código
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[88rem] flex-col items-center justify-between gap-3 px-4 py-6 text-center text-xs text-neutral-500 sm:flex-row sm:px-6 lg:px-8 sm:text-left">
          <p>© {new Date().getFullYear()} SOSme. Argentina.</p>
          <p className="flex items-center gap-1.5 text-neutral-500">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            Contacto de emergencia por QR ·{" "}
            <MessageCircle className="mx-0.5 inline h-3.5 w-3.5" aria-hidden />
            WhatsApp y alertas incluidas
          </p>
        </div>
      </div>
    </footer>
  );
}
