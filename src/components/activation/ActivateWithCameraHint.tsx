import { Camera, QrCode, Smartphone } from "lucide-react";

type ActivateWithCameraHintProps = {
  variant: "public" | "loggedIn";
};

const STEPS = {
  public: [
    "Abrí la cámara de este celular. No hace falta una app.",
    "Apuntá al QR del collar, chapita o sticker.",
    "Entrá al enlace. Si ya tenés cuenta, iniciá sesión. Si ya cargaste el perfil, vas a poder vincularlo a este producto — no hace falta crear otro.",
  ],
  loggedIn: [
    "Abrí la cámara de este celular. No hace falta una app.",
    "Apuntá al QR del collar, chapita o sticker.",
    "Entrá al enlace. Si ya tenés un perfil (por ejemplo tu mascota), vas a poder vincularlo en lugar de crear otro.",
  ],
} as const;

export function ActivateWithCameraHint({ variant }: ActivateWithCameraHintProps) {
  const steps = STEPS[variant];

  return (
    <div>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
        <Camera className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="mt-4 text-center text-2xl font-black text-neutral-900">
        Escaneá el QR con la cámara del celular
      </h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-neutral-600">
        El QR del producto abre SOSme solo. No uses otra cámara dentro de la
        web: la de tu teléfono ya lo lee.
      </p>

      <ol className="mt-8 space-y-4">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-black text-violet-700">
              {index + 1}
            </span>
            <span className="pt-0.5 text-sm leading-relaxed text-neutral-700 sm:text-base">
              {step}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-3">
        <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" aria-hidden />
        <p className="text-sm leading-relaxed text-violet-900">
          En iPhone usá la app Cámara. En Android, la cámara o Google Lens.
        </p>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
        <QrCode className="h-3.5 w-3.5" aria-hidden />
        Un QR = un producto. No se crea un código paralelo.
      </p>
    </div>
  );
}
