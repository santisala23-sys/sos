"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Save } from "lucide-react";
import type { LegalEntitySettings } from "@/lib/legal/entity-settings";
import { adminUi } from "@/components/admin/adminUi";
import { AdminLoading, AdminSectionCard } from "@/components/admin/AdminUiParts";
import { Button } from "@/components/ui/Button";

const emptyForm = {
  legal_name: "",
  cuit: "",
  address: "",
  jurisdiction: "",
  privacy_email: "",
};

const PREVIEW_LINKS = [
  { href: "/privacidad", label: "Privacidad" },
  { href: "/terminos", label: "Términos" },
  { href: "/cookies", label: "Cookies" },
  { href: "/retencion-datos", label: "Retención" },
  { href: "/aviso-datos-sensibles", label: "Datos sensibles" },
  { href: "/aviso-emergencia", label: "Emergencia" },
] as const;

export function AdminLegalPanel() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/legal-entity");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudieron cargar los datos legales");
        return;
      }
      const settings = data.settings as LegalEntitySettings;
      setForm({
        legal_name: settings.legal_name ?? "",
        cuit: settings.cuit ?? "",
        address: settings.address ?? "",
        jurisdiction: settings.jurisdiction ?? "",
        privacy_email: settings.privacy_email ?? "",
      });
      setComplete(Boolean(data.complete));
      setUpdatedAt(settings.updated_at);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/legal-entity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar");
        return;
      }
      const settings = data.settings as LegalEntitySettings;
      setComplete(Boolean(data.complete));
      setUpdatedAt(settings.updated_at);
      setSuccess("Datos legales guardados. Las políticas públicas se actualizan al instante.");
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <AdminLoading label="Cargando datos legales..." />;
  }

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Datos del responsable legal"
        subtitle="Estos valores reemplazan las variables legales en Términos, Privacidad, Cookies y avisos públicos."
        icon={<FileText className="h-5 w-5" />}
      >
        {!complete && (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Faltan campos obligatorios. Hasta completarlos, en las políticas se mostrará texto
            provisional tipo «Razón social pendiente».
          </p>
        )}
        {updatedAt && (
          <p className="mt-2 text-xs text-neutral-500">
            Última actualización: {new Date(updatedAt).toLocaleString("es-AR")}
          </p>
        )}
      </AdminSectionCard>

      <form onSubmit={handleSave} className={`${adminUi.formCard} space-y-4`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-neutral-800">Razón social / titular *</span>
            <input
              type="text"
              value={form.legal_name}
              onChange={(e) => setForm((f) => ({ ...f, legal_name: e.target.value }))}
              placeholder="Ej. SOSme SRL o Nombre Apellido"
              className={`${adminUi.input} mt-1`}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-neutral-800">CUIT/CUIL *</span>
            <input
              type="text"
              value={form.cuit}
              onChange={(e) => setForm((f) => ({ ...f, cuit: e.target.value }))}
              placeholder="20-12345678-9"
              className={`${adminUi.input} mt-1`}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium text-neutral-800">Domicilio legal *</span>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Calle, localidad, provincia, Argentina"
              className={`${adminUi.input} mt-1`}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-neutral-800">Jurisdicción (tribunales) *</span>
            <input
              type="text"
              value={form.jurisdiction}
              onChange={(e) => setForm((f) => ({ ...f, jurisdiction: e.target.value }))}
              placeholder="Ej. Ciudad Autónoma de Buenos Aires"
              className={`${adminUi.input} mt-1`}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-neutral-800">Email privacidad / ARCO</span>
            <input
              type="email"
              value={form.privacy_email}
              onChange={(e) => setForm((f) => ({ ...f, privacy_email: e.target.value }))}
              placeholder="somososme@gmail.com"
              className={`${adminUi.input} mt-1`}
            />
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-700" role="status">
            {success}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar datos legales"}
          </Button>
        </div>
      </form>

      <AdminSectionCard
        title="Vista previa de políticas"
        subtitle="Abrí cada página pública para verificar que los datos legales se reflejan correctamente."
      >
        <div className="flex flex-wrap gap-2">
          {PREVIEW_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              className="rounded-xl border border-violet-100 bg-violet-50/80 px-3.5 py-2 text-sm font-semibold text-violet-800 transition-colors hover:border-violet-200 hover:bg-violet-100"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Google Tag Manager (analytics)"
        subtitle="GTM no se carga con solo «Aceptar necesarias». Solo corre si el visitante acepta analytics y tenés NEXT_PUBLIC_GTM_ID configurado."
      >
        <p className="text-sm text-neutral-600">
          Esto alinea el sitio con la Política de Cookies.
        </p>
      </AdminSectionCard>
    </div>
  );
}
