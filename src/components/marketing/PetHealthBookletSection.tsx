import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  ClipboardList,
  QrCode,
  Stethoscope,
} from "lucide-react";
import { SectionHeading } from "@/components/marketing/SectionHeading";
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
  icon: typeof QrCode;
  media: StepMedia;
}> = [
  {
    step: "01",
    title: "Abrís la libreta y compartís el QR",
    text: "Desde el panel de tu mascota ves vacunas, próximas dosis e historial. Generás un acceso temporal de 24 h para el veterinario.",
    icon: QrCode,
    media: {
      kind: "video",
      src: `${MEDIA_BASE}/demo-tutor-libreta.mp4`,
      poster: `${MEDIA_BASE}/vista-tutor.png`,
      alt: "Libreta sanitaria de Firu con botón QR para veterinario y próximas dosis",
    },
  },
  {
    step: "02",
    title: "El vet ve el historial y carga la visita",
    text: "Con el enlace temporal consulta el historial, elige el tipo de control y registra qué hizo e indicaciones para el hogar.",
    icon: Stethoscope,
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
    text: "Recibís una notificación push al instante. Tocás y volvés a la libreta con la visita ya cargada y verificada.",
    icon: Bell,
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
  /** En la página de servicio no enlazamos otra vez a /servicios/mascotas */
  showServiceLink?: boolean;
};

function StepMediaFrame({ media }: { media: StepMedia }) {
  if (media.kind === "video") {
    return (
      <div className="relative mx-auto mt-8 w-full max-w-[16rem] overflow-hidden rounded-[2.5rem] border-[6px] border-neutral-900 bg-neutral-950 shadow-2xl shadow-teal-500/20">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={media.poster}
          className="h-auto w-full rounded-[2rem] object-cover"
          aria-label={media.alt}
        >
          <source src={media.src} type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div className="relative mx-auto mt-8 w-full max-w-[16rem] aspect-[9/19] overflow-hidden rounded-[2.5rem] border-[6px] border-neutral-900 bg-gradient-to-b from-neutral-800 to-neutral-950 shadow-2xl shadow-teal-500/20">
      <div className="absolute top-1/3 w-full px-4">
        <Image
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          className="h-auto w-full rounded-2xl shadow-xl"
          sizes="(max-width: 640px) 256px, 256px"
        />
      </div>
    </div>
  );
}

export function PetHealthBookletSection({
  showServiceLink = true,
}: PetHealthBookletSectionProps) {
  return (
    <section
      id="libreta-sanitaria"
      className="scroll-mt-32 border-y border-violet-100/80 bg-white/70 px-4 py-24 backdrop-blur-sm sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[88rem]">
        <SectionHeading
          eyebrow="Libreta sanitaria digital"
          title="El veterinario escanea, carga la visita y vos tenés el historial"
          description="Capturas y videos reales del flujo completo: la libreta del tutor, la carga del profesional y la alerta en tu celular."
        />

        <div className="mx-auto mt-10 flex max-w-xl items-center justify-center gap-3 rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50 to-emerald-50 px-5 py-4 text-sm font-semibold text-teal-900 shadow-sm">
          <ClipboardList className="h-5 w-5 shrink-0 text-teal-700" aria-hidden />
          Vacunas, próximas dosis, visitas y archivos (imagen o PDF)
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map(({ step, title, text, icon: Icon, media }) => (
            <article
              key={step}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-teal-100/80 bg-gradient-to-b from-white to-teal-50/40 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10"
            >
              <span className="text-6xl font-black text-teal-100/90">
                {step}
              </span>
              <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-lg shadow-teal-500/25 transition-transform group-hover:scale-105">
                <Icon className="h-7 w-7" aria-hidden />
              </div>
              <h3 className="mt-6 text-xl font-bold text-neutral-900">
                {title}
              </h3>
              <p className="mt-3 flex-1 leading-relaxed text-neutral-600">
                {text}
              </p>
              <StepMediaFrame media={media} />
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          {showServiceLink ? (
            <Link href="/servicios/mascotas">
              <Button
                size="lg"
                className="gap-2 !from-teal-600 !to-emerald-700 hover:!from-teal-700 hover:!to-emerald-800"
              >
                Ver servicio para mascotas
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button
                size="lg"
                className="gap-2 !from-teal-600 !to-emerald-700 hover:!from-teal-700 hover:!to-emerald-800"
              >
                Activar libreta de mi mascota
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
