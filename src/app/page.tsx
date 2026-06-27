import Link from "next/link";
import { Shield, QrCode, Bell, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-200 px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-xl font-black tracking-tight text-blue-800">
            SOS
          </span>
          <nav className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Ingresar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Registrarse</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-1 flex-col px-4 py-12">
        <section className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
            Asistencia y emergencia QR
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-neutral-900 sm:text-5xl">
            Ayuda inmediata para personas con discapacidad
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
            Configurá un perfil de asistencia accesible mediante un código QR
            físico. Fuerzas de seguridad y personal de emergencia pueden
            escanearlo y saber al instante cómo actuar y a quién llamar.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Crear mi perfil gratis</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: QrCode,
              title: "QR imprimible",
              text: "Descargá el código en PNG para plastificarlo o llevarlo donde haga falta.",
            },
            {
              icon: Phone,
              title: "Llamada directa",
              text: "Un toque conecta con el contacto de emergencia de la familia.",
            },
            {
              icon: Shield,
              title: "Instrucciones claras",
              text: "Indicaciones de manejo visibles con alto contraste para situaciones de estrés.",
            },
            {
              icon: Bell,
              title: "Alertas automáticas",
              text: "La familia recibe aviso al escanear el QR o activar SOS.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-neutral-200 p-6"
            >
              <Icon
                className="h-8 w-8 text-blue-700"
                aria-hidden
              />
              <h2 className="mt-4 font-bold">{title}</h2>
              <p className="mt-2 text-sm text-neutral-600">{text}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500">
        SOS — Sistema de Asistencia y Emergencia QR
      </footer>
    </div>
  );
}
