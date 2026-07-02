"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { Button } from "@/components/ui/Button";
import {
  buildPartnerInquiryMessage,
  buildRequestMoreProfilesMessage,
  buildWhatsAppUrl,
} from "@/lib/utils/contact";

const MOTIVES = [
  { id: "mas-perfiles", label: "Quiero más perfiles QR en mi cuenta" },
  { id: "marca-productos", label: "QR en productos / marca de ropa" },
  { id: "otro", label: "Otra consulta" },
] as const;

export default function ContactoPage() {
  const [motivo, setMotivo] = useState<string>("mas-perfiles");
  const [nombre, setNombre] = useState("");
  const [detalle, setDetalle] = useState("");

  function buildMessage(): string {
    const base =
      motivo === "marca-productos"
        ? buildPartnerInquiryMessage({
            brandName: nombre || undefined,
            productType: detalle || undefined,
          })
        : buildRequestMoreProfilesMessage({
            email: nombre.includes("@") ? nombre : undefined,
            profileCount: undefined,
          });

    const extra = [
      nombre && !nombre.includes("@") ? `Nombre: ${nombre}` : null,
      detalle ? `Detalle: ${detalle}` : null,
      motivo === "otro" ? "Consulta general" : null,
    ]
      .filter(Boolean)
      .join("\n");

    return extra ? `${base}\n${extra}` : base;
  }

  const whatsappUrl = buildWhatsAppUrl(buildMessage());

  return (
    <div className="flex min-h-dvh flex-col bg-[#faf9fc]">
      <header className="border-b border-neutral-200/80 bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <Link href="/">
            <BrandLogo size="sm" />
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-violet-700 hover:underline">
            Planes
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10">
        <h1 className="text-2xl font-black text-neutral-900">Contacto</h1>
        <p className="mt-2 text-neutral-600">
          Por ahora atendemos por <strong>WhatsApp</strong>. Completá el formulario y te
          abrimos el chat con el mensaje listo.
        </p>

        <form
          className="mt-8 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            window.open(whatsappUrl, "_blank", "noopener,noreferrer");
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">Motivo</span>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="rounded-xl border border-neutral-300 bg-white px-4 py-3"
            >
              {MOTIVES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">
              Tu nombre o email de cuenta
            </span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="rounded-xl border border-neutral-300 px-4 py-3"
              placeholder="Ej: María / maria@email.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">
              Contanos qué necesitás
            </span>
            <textarea
              rows={4}
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              className="rounded-xl border border-neutral-300 px-4 py-3"
              placeholder={
                motivo === "marca-productos"
                  ? "Ej: Marca de camperas, ~500 unidades por temporada..."
                  : "Ej: Necesito 3 QR: yo, mi hijo y el perro..."
              }
            />
          </label>

          <Button type="submit" size="lg" className="gap-2">
            <MessageCircle className="h-5 w-5" aria-hidden />
            Abrir WhatsApp
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-500">
          Te respondemos a la brevedad. Si preferís, también podés escribirnos directo
          por WhatsApp.
        </p>
      </main>

      <LegalFooter compact />
    </div>
  );
}
