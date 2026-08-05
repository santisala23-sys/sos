"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Mail,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { Button } from "@/components/ui/Button";
import {
  CONTACT_EMAIL,
  getContactMailtoUrl,
  getInstagramUrl,
  getTikTokUrl,
  INSTAGRAM_HANDLE,
  TIKTOK_HANDLE,
} from "@/lib/utils/brand";
import {
  buildContactInquiryMessage,
  buildWhatsAppUrl,
} from "@/lib/utils/contact";
import { cn } from "@/lib/utils/cn";

const MOTIVES = [
  {
    id: "mas-perfiles",
    label: "Quiero más perfiles QR",
    hint: "Ampliá tu cuenta para familia, mascotas u objetos.",
    icon: Users,
  },
  {
    id: "marca-productos",
    label: "QR en productos / marca",
    hint: "Chapitas, collares, stickers o producción con tu logo.",
    icon: Sparkles,
  },
  {
    id: "otro",
    label: "Otra consulta",
    hint: "Cualquier duda sobre SOSme, la tienda o tu cuenta.",
    icon: MessageCircle,
  },
] as const;

type MotiveId = (typeof MOTIVES)[number]["id"];

const CHANNELS = [
  {
    label: "Email",
    value: CONTACT_EMAIL,
    href: getContactMailtoUrl("Consulta SOSme"),
    icon: Mail,
  },
  {
    label: "Instagram",
    value: `@${INSTAGRAM_HANDLE}`,
    href: getInstagramUrl(),
    icon: null,
  },
  {
    label: "TikTok",
    value: `@${TIKTOK_HANDLE}`,
    href: getTikTokUrl(),
    icon: null,
  },
] as const;

export function ContactoPageContent() {
  const [motivo, setMotivo] = useState<MotiveId>("mas-perfiles");
  const [nombre, setNombre] = useState("");
  const [detalle, setDetalle] = useState("");

  const selectedMotive = MOTIVES.find((item) => item.id === motivo) ?? MOTIVES[0];

  const whatsappMessage = useMemo(
    () =>
      buildContactInquiryMessage({
        motivoLabel: selectedMotive.label,
        nombre,
        detalle,
      }),
    [selectedMotive.label, nombre, detalle],
  );

  const whatsappUrl = buildWhatsAppUrl(whatsappMessage);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <MarketingNavbar variant="subpage" />

      <main>
        <section className="relative overflow-hidden px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:px-8">
          <div className="mx-auto max-w-[88rem]">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 px-6 py-10 text-white shadow-2xl shadow-violet-600/30 sm:px-10 sm:py-14">
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                aria-hidden
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.35) 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="relative max-w-3xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-violet-100">
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                  Contacto SOSme
                </p>
                <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                  Hablemos por WhatsApp
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-violet-100">
                  Completá el formulario y te abrimos el chat con SOSme con tu
                  consulta ya escrita. Respondemos a la brevedad.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur-sm">
                    <Clock3 className="h-4 w-4" aria-hidden />
                    Respuesta humana, sin bots
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur-sm">
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Más perfiles, tienda y marcas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[88rem] px-4 pb-24 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-10">
            <form
              onSubmit={handleSubmit}
              className="rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-xl shadow-violet-500/10 backdrop-blur-sm sm:p-8"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-black tracking-tight text-neutral-900">
                  Contanos qué necesitás
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base">
                  Elegí un motivo, completá tus datos y enviá todo por WhatsApp
                  con un solo toque.
                </p>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-neutral-800">
                  Motivo
                </legend>
                <div className="grid gap-3 sm:grid-cols-1">
                  {MOTIVES.map((item) => {
                    const Icon = item.icon;
                    const active = motivo === item.id;
                    return (
                      <label
                        key={item.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all",
                          active
                            ? "border-violet-400 bg-violet-50 shadow-md shadow-violet-500/10 ring-2 ring-violet-200"
                            : "border-neutral-200 bg-neutral-50/70 hover:border-violet-200 hover:bg-violet-50/40",
                        )}
                      >
                        <input
                          type="radio"
                          name="motivo"
                          value={item.id}
                          checked={active}
                          onChange={() => setMotivo(item.id)}
                          className="sr-only"
                        />
                        <span
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                            active
                              ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                              : "bg-white text-violet-700 shadow-sm",
                          )}
                        >
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span>
                          <span className="block font-bold text-neutral-900">
                            {item.label}
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-neutral-600">
                            {item.hint}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-8 grid gap-5">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-neutral-800">
                    Tu nombre o email de cuenta
                  </span>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    className="rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-neutral-900 shadow-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    placeholder="Ej: María / maria@email.com"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-neutral-800">
                    Contanos qué necesitás
                  </span>
                  <textarea
                    rows={5}
                    value={detalle}
                    onChange={(event) => setDetalle(event.target.value)}
                    className="rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-neutral-900 shadow-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    placeholder={
                      motivo === "marca-productos"
                        ? "Ej: Marca de camperas, quiero QR en etiquetas, ~500 unidades por temporada..."
                        : motivo === "mas-perfiles"
                          ? "Ej: Necesito 3 perfiles: yo, mi hijo y el perro..."
                          : "Ej: Tengo una consulta sobre mi cuenta / un pedido..."
                    }
                  />
                </label>
              </div>

              <div className="mt-8 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                  Vista previa del mensaje
                </p>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-700">
                  {whatsappMessage}
                </pre>
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-8 w-full gap-2 bg-[#25D366] text-base font-bold text-white shadow-lg shadow-green-500/25 hover:bg-[#20bd5a]"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                Enviar WhatsApp
              </Button>
            </form>

            <aside className="space-y-6">
              <div className="rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-xl shadow-violet-500/10 backdrop-blur-sm sm:p-8">
                <h2 className="text-xl font-black text-neutral-900">
                  También podés escribirnos acá
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  Si preferís no usar el formulario, estos son nuestros canales
                  directos.
                </p>

                <ul className="mt-6 space-y-3">
                  <li>
                    <a
                      href={buildWhatsAppUrl("Hola SOSme")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 transition hover:border-green-300 hover:bg-green-100/80"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-md">
                        <MessageCircle className="h-5 w-5" aria-hidden />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-neutral-900">
                          WhatsApp directo
                        </span>
                        <span className="mt-0.5 block text-sm text-neutral-600">
                          Mensaje rápido sin formulario
                        </span>
                      </span>
                      <ArrowRight className="ml-auto h-4 w-4 text-green-700" aria-hidden />
                    </a>
                  </li>

                  {CHANNELS.map((channel) => (
                    <li key={channel.label}>
                      <a
                        href={channel.href}
                        target={channel.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          channel.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 px-4 py-4 transition hover:border-violet-200 hover:bg-violet-50/60"
                      >
                        {channel.icon ? (
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                            <channel.icon className="h-5 w-5" aria-hidden />
                          </span>
                        ) : (
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-sm font-black text-violet-700">
                            @
                          </span>
                        )}
                        <span>
                          <span className="block text-sm font-bold text-neutral-900">
                            {channel.label}
                          </span>
                          <span className="mt-0.5 block text-sm text-neutral-600">
                            {channel.value}
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.75rem] border border-violet-200/80 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 shadow-lg shadow-violet-500/10 sm:p-8">
                <h3 className="text-lg font-black text-neutral-900">
                  ¿Ya tenés cuenta?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  Si querés más perfiles QR, podés pedirlos desde acá o entrar al
                  panel y seguir usando SOSme mientras te respondemos.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link href="/register" className="flex-1">
                    <Button variant="secondary" className="w-full">
                      Crear cuenta
                    </Button>
                  </Link>
                  <Link href="/login" className="flex-1">
                    <Button className="w-full">Ingresar</Button>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
