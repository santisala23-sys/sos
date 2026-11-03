import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const MEDIA_BASE = "/images/landing/libreta-sanitaria";

type StepMedia =
  | {
      kind: "video";
      src: string;
      poster: string;
      alt: string;
    }
  | {
      kind: "image";
      src: string;
      alt: string;
      width: number;
      height: number;
    };

const STEPS: ReadonlyArray<{
  step: string;
  title: string;
  text: string;
  media: StepMedia;
}> = [
  {
    step: "01",
    title: "Abrís la libreta y compartís el QR",
    text: "Desde el panel ves vacunas, próximas dosis e historial. El acceso del veterinario es otro QR, distinto al de la chapita, y dura 24 horas.",
    media: {
      kind: "video",
      src: `${MEDIA_BASE}/demo-tutor-libreta.mp4`,
      poster: `${MEDIA_BASE}/vista-tutor.png`,
      alt: "Libreta sanitaria de Firu con botón QR para veterinario y próximas dosis",
    },
  },
  {
    step: "02",
    title: "El veterinario ve el historial y carga la visita",
    text: "Con el enlace temporal consulta el historial, elige el tipo de control y registra qué hizo e indicaciones para el hogar.",
    media: {
      kind: "video",
      src: `${MEDIA_BASE}/demo-veterinario.mp4`,
      poster: `${MEDIA_BASE}/demo-veterinario-poster.png`,
      alt: "Formulario veterinario para cargar una visita en la libreta de Firu",
    },
  },
  {
    step: "03",
    title: "Te avisamos y queda guardado",
    text: "Recibís una notificación al instante. Tocás y volvés a la libreta con la visita ya cargada y verificada.",
    media: {
      kind: "image",
      src: `${MEDIA_BASE}/notificacion-visita.png`,
      alt: "Notificación push de SOSme: Roberto Perez cargó una visita veterinaria para Firu",
      width: 503,
      height: 220,
    },
  },
];

type PetHealthBookletSectionProps = {
  showServiceLink?: boolean;
};

function StepMedia({ media }: { media: StepMedia }) {
  if (media.kind === "video") {
    return (
      <div className="mx-auto w-full max-w-[12.5rem] overflow-hidden rounded-2xl shadow-md shadow-violet-500/10">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={media.poster}
          className="h-auto w-full"
          aria-label={media.alt}
        >
          <source src={media.src} type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[14rem]">
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        className="h-auto w-full rounded-2xl shadow-md shadow-violet-500/10"
        sizes="(max-width: 640px) 224px, 256px"
      />
    </div>
  );
}

export function PetHealthBookletSection({
  showServiceLink = true,
}: PetHealthBookletSectionProps) {
  return (
    <section
      id="libreta-sanitaria"
      className="scroll-mt-32 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-[88rem]">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black leading-[1.08] tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.75rem]">
            Libreta sanitaria{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
              digital
            </span>
          </h2>
          <p className="mt-3 text-lg font-medium leading-snug text-neutral-600 sm:text-xl">
            No es el QR de la chapita. Generás un acceso de 24 horas para que{" "}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text font-semibold text-transparent">
              el veterinario cargue la visita
            </span>
          </p>
        </div>

        <div className="mt-12 rounded-[2rem] border border-violet-200/70 bg-white/55 p-5 shadow-sm shadow-violet-500/5 backdrop-blur-sm sm:mt-14 sm:rounded-[2.5rem] sm:p-8 lg:p-10">
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {STEPS.map(({ step, title, text, media }) => (
              <article
                key={step}
                className="flex h-full flex-col rounded-2xl border border-violet-100/90 bg-white/80 p-5 shadow-sm sm:p-6"
              >
                <div className="flex min-h-[14rem] flex-1 items-center justify-center sm:min-h-[15.5rem]">
                  <StepMedia media={media} />
                </div>
                <div className="pt-2">
                  <span className="text-3xl font-black tabular-nums leading-none text-violet-600">
                    {step}
                  </span>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-neutral-900">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    {text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {showServiceLink ? (
          <div className="mt-10 flex justify-center sm:mt-12">
            <Link href="/servicios/mascotas">
              <Button
                variant="ghost"
                size="lg"
                className="gap-2 rounded-2xl border border-violet-200/90 bg-white/90 px-8 font-semibold text-violet-900 shadow-sm backdrop-blur-sm transition-all hover:border-violet-300 hover:bg-white hover:shadow-md"
              >
                Ver servicio para mascotas
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-10 flex justify-center sm:mt-12">
            <Link href="/register">
              <Button
                variant="ghost"
                size="lg"
                className="gap-2 rounded-2xl border border-violet-200/90 bg-white/90 px-8 font-semibold text-violet-900 shadow-sm backdrop-blur-sm transition-all hover:border-violet-300 hover:bg-white hover:shadow-md"
              >
                Activar libreta de mi mascota
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
