"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { buildWhatsAppUrl } from "@/lib/utils/contact";

export function FloatingWhatsAppButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/p/")) return null;

  const href = buildWhatsAppUrl("Hola SOSme, tengo una consulta.");

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-2 right-1 z-50 block sm:bottom-4 sm:right-3"
      aria-label="¿Tenés alguna consulta? Hablá con nosotros por WhatsApp"
    >
      <div className="relative sos-contact-float w-[min(20rem,calc(100vw-1rem))] sm:w-[21rem]">
        {/* Burbuja saliendo de la mano (arriba-derecha del personaje) */}
        <div className="absolute bottom-[5.75rem] right-[2.25rem] z-10 sm:bottom-[7.25rem] sm:right-[2.75rem]">
          <div className="relative max-w-[15.5rem] rounded-[1.35rem] border border-violet-200/90 bg-gradient-to-br from-white via-white to-violet-50 px-5 py-4 shadow-[0_16px_40px_rgba(109,40,217,0.22)] ring-1 ring-white/80 transition-transform duration-300 group-hover:-translate-y-1 sm:max-w-[17rem] sm:px-6 sm:py-[1.125rem]">
            <p className="text-[0.95rem] font-black leading-snug tracking-tight text-neutral-900 sm:text-lg">
              ¿Tenés alguna consulta?
            </p>
            <p className="mt-1.5 text-sm font-semibold leading-snug text-violet-700">
              Hablá con nosotros, estamos para ayudarte
            </p>
          </div>

          {/* Cola de la burbuja hacia la mano que saluda */}
          <span
            className="absolute -bottom-2.5 right-5 h-4 w-4 rotate-[135deg] rounded-sm border-b border-r border-violet-200/90 bg-gradient-to-br from-white to-violet-50 shadow-[2px_2px_6px_rgba(109,40,217,0.08)] sm:right-6"
            aria-hidden
          />
        </div>

        <div className="relative ml-auto h-[6.75rem] w-[6.75rem] sm:h-[8.75rem] sm:w-[8.75rem]">
          <Image
            src="/images/contact/bitmoji-support.png"
            alt=""
            width={350}
            height={350}
            priority={false}
            className="h-full w-full object-contain object-bottom drop-shadow-[0_18px_28px_rgba(88,28,135,0.32)] transition-transform duration-300 group-hover:scale-[1.03] group-active:scale-[0.98]"
            sizes="(max-width: 640px) 108px, 140px"
          />
        </div>
      </div>

      <span className="sr-only">Abrir WhatsApp</span>
    </a>
  );
}
