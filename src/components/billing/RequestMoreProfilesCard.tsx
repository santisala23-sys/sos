"use client";

import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  buildRequestMoreProfilesMessage,
  buildWhatsAppUrl,
} from "@/lib/utils/contact";

type RequestMoreProfilesCardProps = {
  email?: string;
  profileCount?: number;
  compact?: boolean;
};

export function RequestMoreProfilesCard({
  email,
  profileCount,
  compact = false,
}: RequestMoreProfilesCardProps) {
  const whatsappUrl = buildWhatsAppUrl(
    buildRequestMoreProfilesMessage({ email, profileCount }),
  );

  if (compact) {
    return (
      <p className="text-sm text-neutral-600">
        ¿Necesitás más QR?{" "}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-violet-700 underline-offset-2 hover:underline"
        >
          Escribinos por WhatsApp
        </a>{" "}
        o visitá{" "}
        <Link href="/contacto" className="font-semibold text-violet-700 underline-offset-2 hover:underline">
          contacto
        </Link>
        .
      </p>
    );
  }

  return (
    <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 shadow-sm">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-neutral-900">¿Querés más perfiles QR?</h3>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">
            El plan gratis incluye <strong>1 perfil</strong> (persona, mascota u objeto).
            Si necesitás más para tu familia o tu negocio, contactanos y te ampliamos la
            cuenta manualmente — sin pagos automáticos por ahora.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button type="button" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" aria-hidden />
                Pedir más por WhatsApp
              </Button>
            </a>
            <Link href="/pricing">
              <Button type="button" variant="secondary" size="sm">
                Ver planes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
