import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { USE_CASE_CARDS } from "@/lib/marketing/services";

/** Misma proporción en las tres cards (referencia mascotas / objetos). */
const CARD_ASPECT = "aspect-[686/1024]";

export function UseCasesSection() {
  return (
    <section
      id="casos"
      className="scroll-mt-32 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-[88rem]">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black leading-[1.08] tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.75rem]">
            Casos de{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
              uso
            </span>
          </h2>
          <p className="mt-3 text-lg font-medium leading-snug text-neutral-600 sm:text-xl">
            Para lo que{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text font-semibold text-transparent">
              más te importa
            </span>
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {USE_CASE_CARDS.map(
            ({
              href,
              title,
              description,
              detail,
              image,
              imageAlt,
            }) => (
              <Link
                key={title}
                href={href}
                className={`group relative ${CARD_ASPECT} w-full overflow-hidden rounded-2xl border border-violet-100/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10`}
              >
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/45 to-neutral-950/10"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">
                    {description}
                  </p>
                  {detail ? (
                    <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                      {detail}
                    </p>
                  ) : null}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-200 transition-colors group-hover:text-white">
                    Conocer más
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
