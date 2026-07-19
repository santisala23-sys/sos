"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { buildWhatsAppUrl } from "@/lib/utils/contact";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function FloatingWhatsAppButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/p/")) return null;

  const href = buildWhatsAppUrl("Hola SOSme, tengo una consulta.");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-4 right-3 z-50 flex max-w-[calc(100vw-1.5rem)] items-end gap-2.5 sm:bottom-5 sm:right-5 sm:gap-3"
      aria-label="¿Tenés alguna consulta? Hablá con nosotros por WhatsApp"
    >
      <div className="relative mb-2 hidden max-w-[13rem] rounded-2xl rounded-br-md border border-violet-100/90 bg-white px-4 py-3 shadow-xl shadow-violet-500/15 transition-transform duration-300 group-hover:-translate-y-0.5 sm:mb-3 sm:block">
        <p className="text-sm font-bold leading-snug text-neutral-900">
          ¿Tenés alguna consulta?
        </p>
        <p className="mt-1 text-xs font-semibold text-violet-700">
          Hablá con nosotros por WhatsApp
        </p>
        <span
          className="absolute -bottom-2 right-6 h-3 w-3 rotate-45 border-b border-r border-violet-100 bg-white"
          aria-hidden
        />
      </div>

      <div className="relative shrink-0 sos-contact-float">
        <div className="relative h-[5.25rem] w-[5.25rem] sm:h-[6.25rem] sm:w-[6.25rem]">
          <Image
            src="/images/contact/bitmoji-support.png"
            alt=""
            width={256}
            height={256}
            className="h-full w-full object-contain drop-shadow-[0_12px_24px_rgba(88,28,135,0.28)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95"
            sizes="100px"
          />
          <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-[3px] ring-white">
            <WhatsAppIcon className="h-[1.125rem] w-[1.125rem]" />
          </span>
        </div>
      </div>

      <span className="sr-only">Abrir WhatsApp</span>
    </a>
  );
}
