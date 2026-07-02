import Link from "next/link";
import type { Metadata } from "next";
import { Package, QrCode, Shirt, Tag } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { Button } from "@/components/ui/Button";
import {
  buildPartnerInquiryMessage,
  buildWhatsAppUrl,
} from "@/lib/utils/contact";

export const metadata: Metadata = {
  title: "QR en productos físicos",
  description: "Etiquetas QR para marcas de ropa, accesorios y productos con activación por el comprador.",
};

const FLOW = [
  {
    step: "1",
    title: "La marca imprime el QR",
    text: "En etiqueta de ropa, hang tag, packaging o sticker resistente. Cada unidad puede tener un código único.",
  },
  {
    step: "2",
    title: "El comprador escanea y activa",
    text: "Primera vez: se registra en SOSme y vincula el QR a su perfil (emergencia, contacto o info del producto).",
  },
  {
    step: "3",
    title: "Escaneos siguientes",
    text: "Muestran el perfil ya configurado — útil para emergencia, devoluciones, autenticidad o contacto post-venta.",
  },
] as const;

const USE_CASES = [
  {
    icon: Shirt,
    title: "Ropa y accesorios",
    text: "Chaqueta de niño, campera outdoor, mochila escolar — contacto del tutor si se pierde.",
  },
  {
    icon: Tag,
    title: "Collares y chapas",
    text: "Mascotas, identificación médica, credenciales — mismo flujo que hoy, pero pre-impreso.",
  },
  {
    icon: Package,
    title: "Packaging premium",
    text: "Electrónica, equipaje, herramientas — registro de dueño + asistencia.",
  },
] as const;

export default function ProductosPage() {
  const whatsappPartner = buildWhatsAppUrl(buildPartnerInquiryMessage({}));

  return (
    <div className="flex min-h-dvh flex-col bg-[#faf9fc]">
      <header className="border-b border-neutral-200/80 bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link href="/">
            <BrandLogo size="sm" />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pricing" className="text-neutral-600 hover:text-violet-700">
              Planes
            </Link>
            <Link href="/contacto" className="font-medium text-violet-700 hover:underline">
              Contacto
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6">
        <div className="flex items-center gap-2 text-violet-700">
          <QrCode className="h-5 w-5" aria-hidden />
          <p className="text-sm font-semibold uppercase tracking-widest">Para marcas y productos</p>
        </div>
        <h1 className="mt-3 text-3xl font-black text-neutral-900 sm:text-4xl">
          QR en la prenda. Activación en el bolsillo.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-neutral-600">
          Imaginá una etiqueta en una remera o campera: el cliente escanea, crea su perfil
          SOSme y queda vinculado. Si pasa algo, la familia recibe la alerta — o podés usar
          el QR solo para contacto y post-venta.
        </p>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-neutral-900">Cómo lo pensamos</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {FLOW.map(({ step, title, text }) => (
              <li
                key={step}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <span className="text-3xl font-black text-violet-200">{step}</span>
                <h3 className="mt-2 font-bold text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-bold text-neutral-900">Casos de uso</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {USE_CASES.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-neutral-200 bg-white p-5"
              >
                <Icon className="h-6 w-6 text-violet-600" aria-hidden />
                <h3 className="mt-3 font-bold text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-bold text-amber-950">Estado hoy</h2>
          <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
            La app ya soporta perfiles QR individuales (freemium: 1 gratis). La{" "}
            <strong>activación masiva por lote</strong> (códigos pre-impresos para marcas)
            está en la base técnica y la armamos con los primeros partners a medida.
            Si tenés una marca o fabricás etiquetas, escribinos.
          </p>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <a href={whatsappPartner} target="_blank" rel="noopener noreferrer">
            <Button size="lg">Consultar para mi marca</Button>
          </a>
          <Link href="/contacto">
            <Button variant="secondary" size="lg">
              Formulario de contacto
            </Button>
          </Link>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}
