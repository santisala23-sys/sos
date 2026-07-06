import Image from "next/image";
import { Play } from "lucide-react";

const DEMO_VIDEO_YOUTUBE_ID = process.env.NEXT_PUBLIC_DEMO_VIDEO_YOUTUBE_ID ?? "";

type DemoVideoSectionProps = {
  className?: string;
};

export function DemoVideoSection({ className = "" }: DemoVideoSectionProps) {
  const hasVideo = DEMO_VIDEO_YOUTUBE_ID.length > 0;

  return (
    <section
      id="demo"
      className={`scroll-mt-32 px-4 py-24 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="mx-auto max-w-[88rem]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600">
            Demo en video
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
            Mirá SOSme en acción
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-neutral-600">
            En menos de un minuto ves el recorrido completo: escanean el QR,
            contactan al familiar y llega la alerta al celular.
          </p>
        </div>

        <div className="relative mx-auto mt-14 max-w-4xl">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-violet-400/20 via-indigo-300/15 to-rose-300/15 blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-neutral-950 shadow-2xl shadow-violet-500/20">
            <div className="relative aspect-video w-full">
              {hasVideo ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${DEMO_VIDEO_YOUTUBE_ID}?rel=0`}
                  title="Demo de uso de SOSme"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <>
                  <Image
                    src="/images/landing/hero-scan.png"
                    alt=""
                    fill
                    className="object-cover opacity-60"
                    sizes="(max-width: 896px) 100vw, 896px"
                    aria-hidden
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-neutral-950/20" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-violet-700 shadow-2xl shadow-violet-500/30 ring-4 ring-white/50">
                      <Play className="ml-1 h-9 w-9 fill-current" aria-hidden />
                    </span>
                    <p className="max-w-md text-lg font-semibold text-white">
                      Video demo próximamente
                    </p>
                    <p className="max-w-sm text-sm text-white/75">
                      Mientras tanto, recorré los pasos en la sección de abajo.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
