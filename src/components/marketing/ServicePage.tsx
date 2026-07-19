import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { Button } from "@/components/ui/Button";
import { SERVICE_LIST, type ServiceContent } from "@/lib/marketing/services";

type ServicePageProps = {
  service: ServiceContent;
};

export function ServicePage({ service }: ServicePageProps) {
  const others = SERVICE_LIST.filter((s) => s.slug !== service.slug);

  return (
    <MarketingBackground>
      <MarketingNavbar variant="subpage" activeService={service.slug} />

      <main>
        {/* Hero full-bleed */}
        <section className="relative min-h-[78vh] overflow-hidden">
          <Image
            src={service.heroImage}
            alt={service.heroImageAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${service.accentFrom} ${service.accentTo} opacity-80`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/25 to-neutral-950/10" />

          <div className="relative mx-auto flex min-h-[78vh] max-w-[88rem] flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/85">
              SOSme · {service.eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {service.heroHeadline}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90 sm:text-xl">
              {service.heroSupport}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button
                  size="lg"
                  className="gap-2 bg-white px-8 text-neutral-900 shadow-xl hover:bg-white/95"
                >
                  Empezar gratis
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
              </Link>
              <Link href="/tienda">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/35 bg-white/15 px-8 text-white hover:bg-white/25"
                >
                  Ver productos
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-[88rem] px-4 py-24 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Qué incluye"
            title={service.featuresTitle}
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {service.features.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-3xl border border-violet-100 bg-white/90 p-7 shadow-lg shadow-violet-500/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h2 className="mt-5 text-xl font-bold text-neutral-900">
                  {title}
                </h2>
                <p className="mt-2 leading-relaxed text-neutral-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Scenarios */}
        <section className="border-y border-violet-100/80 bg-white/70 px-4 py-24 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[88rem]">
            <SectionHeading
              eyebrow="Para qué sirve"
              title={service.scenariosTitle}
            />
            <ul className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
              {service.scenarios.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white bg-white/90 px-5 py-4 shadow-sm"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="font-medium text-neutral-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Other services */}
        <section className="mx-auto max-w-[88rem] px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="También podés usar SOSme para"
            title="Otros casos de uso"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={other.href}
                className="group overflow-hidden rounded-[1.75rem] border border-white/90 bg-white shadow-lg shadow-violet-500/8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/15"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={other.image}
                    alt={other.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-xl font-black">{other.eyebrow}</p>
                    <p className="mt-1 text-sm text-white/85">
                      Ver servicio →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[88rem] px-4 pb-28 sm:px-6 lg:px-8">
          <div
            className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${service.accentFrom} ${service.accentTo} px-6 py-16 text-center shadow-2xl sm:px-14`}
          >
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              {service.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
              {service.ctaText}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white px-8 text-neutral-900 hover:bg-white/95"
                >
                  Crear perfil gratis
                </Button>
              </Link>
              <Link href="/#casos">
                <Button
                  size="lg"
                  variant="secondary"
                  className="border-white/30 bg-white/10 px-8 text-white hover:bg-white/20"
                >
                  Ver todos los casos
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </MarketingBackground>
  );
}
