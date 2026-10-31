import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { USE_CASE_CARDS } from "@/lib/marketing/services";

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

        <div className="mt-10 grid items-start gap-5 sm:mt-12 lg:grid-cols-3 lg:gap-6">
          {USE_CASE_CARDS.map(
            ({
              href,
              title,
              description,
              detail,
              image,
              imageAlt,
              imageWidth,
              imageHeight,
            }) => (
              <Link
                key={title}
                href={href}
                className="group flex h-fit w-full flex-col self-start overflow-hidden rounded-2xl border border-violet-100/90 bg-white/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10"
              >
                <div className="relative w-full overflow-hidden bg-gradient-to-b from-violet-50/50 to-white">
                  <Image
                    src={image}
                    alt={imageAlt}
                    width={imageWidth}
                    height={imageHeight}
                    className="h-auto w-full"
                    sizes="(max-width: 1024px) 90vw, 30vw"
                  />
                </div>
                <div className="flex flex-col p-5 sm:p-6">
                  <h3 className="text-xl font-bold text-neutral-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {description}
                  </p>
                  {detail ? (
                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                      {detail}
                    </p>
                  ) : null}
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 transition-colors group-hover:text-violet-900">
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
