import Link from "next/link";
import { HeroImageCarousel } from "@/components/marketing/HeroImageCarousel";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { PetHealthBookletSection } from "@/components/marketing/PetHealthBookletSection";
import { UseCasesSection } from "@/components/marketing/UseCasesSection";
import { WhatIsSosmeSection } from "@/components/marketing/WhatIsSosmeSection";
import { StoreCatalogSection } from "@/components/store/StoreCatalogSection";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function HomePage() {
  return (
    <>
      <MarketingNavbar />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-[88rem] px-4 pb-24 pt-8 sm:px-6 sm:pt-12 lg:px-8">
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] md:gap-12 lg:gap-16 xl:gap-20">
            <div className="relative mx-auto w-full max-w-md md:max-w-none md:justify-self-start">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-violet-400/20 via-indigo-300/15 to-rose-300/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-violet-500/25">
                <HeroImageCarousel />
              </div>
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black leading-[1.08] tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                  SOSme:
                </span>{" "}
                Escaneo y contacto al instante.
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 sm:text-xl md:mx-0">
                Tu perfil de emergencia en un QR para personas y mascotas.
                Alertas al instante y, para tu mascota, toda su libreta
                sanitaria digital.
              </p>

              <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center md:justify-start">
                <a href="#catalogo" className="sm:inline-flex">
                  <Button
                    size="md"
                    className="group w-full gap-2.5 rounded-2xl border border-white/25 px-7 py-3.5 text-base font-semibold shadow-lg shadow-violet-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-violet-600 hover:to-indigo-700 hover:shadow-xl hover:shadow-violet-600/28 active:translate-y-0 sm:w-auto"
                  >
                    Ver productos
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Button>
                </a>
                <Link href="/activar" className="sm:inline-flex">
                  <Button
                    variant="ghost"
                    size="md"
                    className="w-full rounded-2xl border border-violet-200/90 bg-white/85 px-7 py-3.5 text-base font-semibold text-violet-950 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-violet-300 hover:bg-white hover:shadow-md active:scale-[0.99] sm:w-auto"
                  >
                    Activar mi producto
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <WhatIsSosmeSection />

        <UseCasesSection />

        <HowItWorksSection />

        <PetHealthBookletSection />

        <StoreCatalogSection />
      </main>

      <MarketingFooter />
    </>
  );
}
