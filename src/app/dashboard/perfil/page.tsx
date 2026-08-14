"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileDown, UserX } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PerfilPage() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [accountMsg, setAccountMsg] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setAccountMsg(null);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAccountMsg(data.error ?? "No se pudo exportar");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sosme-export-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setAccountMsg("Exportación generada.");
    } catch {
      setAccountMsg("Error de conexión");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteRequest() {
    const ok = window.confirm(
      "¿Querés solicitar la baja de tu cuenta? Se programará la eliminación/anonimización según la política de retención.",
    );
    if (!ok) return;
    setDeleting(true);
    setAccountMsg(null);
    try {
      const res = await fetch("/api/account/delete-request", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAccountMsg(data.error ?? "No se pudo solicitar la baja");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setAccountMsg("Error de conexión");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-black text-neutral-900 sm:text-3xl">
          Perfil
        </h1>
        <p className="mt-2 text-sm text-neutral-600 sm:text-base">
          Gestioná tu cuenta: descargá una copia de tus datos o solicitá la baja.
        </p>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-neutral-900">Cuenta</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Podés descargar una copia de tus datos o solicitar la baja de tu cuenta.
        </p>
        {accountMsg && (
          <p className="mt-3 text-sm text-neutral-700" role="status">
            {accountMsg}
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            disabled={exporting}
            onClick={handleExport}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" aria-hidden />
            {exporting ? "Generando..." : "Descargar mis datos"}
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={deleting}
            onClick={handleDeleteRequest}
            className="gap-2"
          >
            <UserX className="h-4 w-4" aria-hidden />
            {deleting ? "Procesando..." : "Solicitar baja de cuenta"}
          </Button>
        </div>
      </section>
    </main>
  );
}
