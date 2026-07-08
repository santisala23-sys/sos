"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Download,
  ImagePlus,
  LayoutTemplate,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Scissors,
  Trash2,
  Type,
} from "lucide-react";
import {
  PRINT_TEMPLATE_PRESETS,
  createDefaultLayoutForSize,
  type PrintTemplateRow,
} from "@/lib/activation/print-template-types";
import type { PrintTemplateCanvasHandle } from "@/components/admin/PrintTemplateCanvas";
import { adminUi } from "@/components/admin/adminUi";

const PrintTemplateCanvas = dynamic(
  () =>
    import("@/components/admin/PrintTemplateCanvas").then(
      (mod) => mod.PrintTemplateCanvas,
    ),
  { ssr: false, loading: () => <p className="text-sm text-neutral-500">Cargando editor...</p> },
);

export function AdminPrintTemplatesPanel() {
  const [templates, setTemplates] = useState<PrintTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);

  const [name, setName] = useState("");
  const [pageWidthMm, setPageWidthMm] = useState(40);
  const [pageHeightMm, setPageHeightMm] = useState(40);
  const [cutLayerEnabled, setCutLayerEnabled] = useState(false);
  const [presetKey, setPresetKey] = useState("0");
  const [layout, setLayout] = useState(createDefaultLayoutForSize(40, 40));
  const [editorKey, setEditorKey] = useState(0);

  const canvasRef = useRef<PrintTemplateCanvasHandle | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/print-templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startNew() {
    setEditingId("new");
    setName("");
    setPageWidthMm(40);
    setPageHeightMm(40);
    setCutLayerEnabled(false);
    setPresetKey("0");
    setLayout(createDefaultLayoutForSize(40, 40));
    setEditorKey((k) => k + 1);
    setError(null);
  }

  function startEdit(template: PrintTemplateRow) {
    setEditingId(template.id);
    setName(template.name);
    setPageWidthMm(template.page_width_mm);
    setPageHeightMm(template.page_height_mm);
    setCutLayerEnabled(template.cut_layer_enabled);
    setLayout(template.layout_json);
    setEditorKey((k) => k + 1);
    setError(null);
  }

  function applyPreset(index: number) {
    const preset = PRINT_TEMPLATE_PRESETS[index];
    if (!preset) return;
    setPresetKey(String(index));
    setPageWidthMm(preset.widthMm);
    setPageHeightMm(preset.heightMm);
    setLayout(createDefaultLayoutForSize(preset.widthMm, preset.heightMm));
    setEditorKey((k) => k + 1);
  }

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/print-templates/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Error al subir archivo");
      return null;
    }
    return data.url as string;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = await uploadFile(file);
    if (url) await canvasRef.current?.addImage(url);
  }

  async function handleBackgroundUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = await uploadFile(file);
    if (url) await canvasRef.current?.setBackground(url);
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const layoutJson = canvasRef.current?.getLayout() ?? layout;
      const payload = {
        name: name.trim() || "Sin nombre",
        page_width_mm: pageWidthMm,
        page_height_mm: pageHeightMm,
        layout_json: layoutJson,
        cut_layer_enabled: cutLayerEnabled,
      };

      const res =
        editingId && editingId !== "new"
          ? await fetch(`/api/admin/print-templates/${editingId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch("/api/admin/print-templates", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al guardar");
        return;
      }

      setEditingId(data.template.id);
      setLayout(data.template.layout_json);
      await load();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta plantilla?")) return;
    const res = await fetch(`/api/admin/print-templates/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo eliminar");
      return;
    }
    if (editingId === id) setEditingId(null);
    await load();
  }

  if (editingId) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {editingId === "new" ? "Nueva plantilla" : "Editar plantilla"}
            </h2>
            <p className="text-sm text-neutral-500">
              Armá el diseño, guardalo y usalo al generar lotes para imprenta.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              Volver al listado
            </button>
            {editingId !== "new" && (
              <a
                href={`/api/admin/print-templates/${editingId}?format=preview`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 px-4 py-2 text-sm font-medium text-violet-800 hover:bg-violet-50"
              >
                <Download className="h-4 w-4" />
                Preview PDF
              </a>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className={`grid gap-6 xl:grid-cols-[280px_1fr]`}>
          <aside className="space-y-4">
            <div className={adminUi.formCard}>
              <h3 className="text-sm font-semibold text-neutral-800">Configuración</h3>
              <label className="mt-4 block text-sm text-neutral-600">
                Nombre
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`mt-1 w-full ${adminUi.inputPlain}`}
                  placeholder="Ej. Llavero 4×4"
                />
              </label>

              <label className="mt-3 block text-sm text-neutral-600">
                Preset de tamaño
                <select
                  value={presetKey}
                  onChange={(e) => applyPreset(Number(e.target.value))}
                  className={`mt-1 w-full ${adminUi.inputPlain}`}
                >
                  {PRINT_TEMPLATE_PRESETS.map((preset, index) => (
                    <option key={preset.label} value={index}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="block text-sm text-neutral-600">
                  Ancho (mm)
                  <input
                    type="number"
                    min={5}
                    max={300}
                    step={0.1}
                    value={pageWidthMm}
                    onChange={(e) => setPageWidthMm(Number(e.target.value))}
                    className={`mt-1 w-full ${adminUi.inputPlain}`}
                  />
                </label>
                <label className="block text-sm text-neutral-600">
                  Alto (mm)
                  <input
                    type="number"
                    min={5}
                    max={300}
                    step={0.1}
                    value={pageHeightMm}
                    onChange={(e) => setPageHeightMm(Number(e.target.value))}
                    className={`mt-1 w-full ${adminUi.inputPlain}`}
                  />
                </label>
              </div>

              <label className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  checked={cutLayerEnabled}
                  onChange={(e) => setCutLayerEnabled(e.target.checked)}
                  className="rounded border-neutral-300 text-violet-600"
                />
                Incluir capa de corte (magenta)
              </label>
            </div>

            <div className={adminUi.formCard}>
              <h3 className="text-sm font-semibold text-neutral-800">Elementos</h3>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={() => void canvasRef.current?.addQr()}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-violet-50"
                >
                  <QrCode className="h-4 w-4 text-violet-600" />
                  QR (ejemplo)
                </button>
                <button
                  type="button"
                  onClick={() => canvasRef.current?.addText()}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-violet-50"
                >
                  <Type className="h-4 w-4 text-violet-600" />
                  Texto
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-violet-50"
                >
                  <ImagePlus className="h-4 w-4 text-violet-600" />
                  Imagen / logo
                </button>
                <button
                  type="button"
                  onClick={() => bgInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-violet-50"
                >
                  <LayoutTemplate className="h-4 w-4 text-violet-600" />
                  Fondo
                </button>
                <button
                  type="button"
                  onClick={() => canvasRef.current?.addCutCircle()}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-violet-50"
                >
                  <Scissors className="h-4 w-4 text-fuchsia-600" />
                  Círculo de corte
                </button>
                <button
                  type="button"
                  onClick={() => canvasRef.current?.addCutHole()}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-violet-50"
                >
                  <Scissors className="h-4 w-4 text-fuchsia-600" />
                  Perforación
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => void handleImageUpload(e)}
              />
              <input
                ref={bgInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => void handleBackgroundUpload(e)}
              />
            </div>

            <div className={adminUi.formCard}>
              <h3 className="text-sm font-semibold text-neutral-800">Alinear selección</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(
                  [
                    ["left", AlignLeft],
                    ["center-h", AlignCenter],
                    ["right", AlignRight],
                    ["top", ArrowUp],
                    ["center-v", AlignCenter],
                    ["bottom", ArrowDown],
                  ] as const
                ).map(([mode, Icon]) => (
                  <button
                    key={mode}
                    type="button"
                    title={mode}
                    onClick={() => canvasRef.current?.alignSelected(mode)}
                    className="rounded-lg border border-neutral-200 p-2 hover:bg-violet-50"
                  >
                    <Icon className="h-4 w-4 text-neutral-600" />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <PrintTemplateCanvas
            key={editorKey}
            pageWidthMm={pageWidthMm}
            pageHeightMm={pageHeightMm}
            layout={layout}
            canvasRef={canvasRef}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Plantillas de imprenta</h2>
          <p className="text-sm text-neutral-500">
            Diseños reutilizables para PDFs con QR listos para mandar a la gráfica.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className={adminUi.refreshBtn}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={startNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
          >
            <Plus className="h-4 w-4" />
            Nueva plantilla
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {loading && templates.length === 0 ? (
        <p className="text-neutral-500">Cargando plantillas...</p>
      ) : templates.length === 0 ? (
        <div className={`${adminUi.formCard} text-center`}>
          <LayoutTemplate className="mx-auto h-10 w-10 text-violet-400" />
          <p className="mt-3 text-neutral-600">Todavía no hay plantillas.</p>
          <button
            type="button"
            onClick={startNew}
            className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
          >
            Crear la primera
          </button>
        </div>
      ) : (
        <div className={adminUi.tableWrap}>
          <table className="w-full text-left text-sm">
            <thead className={adminUi.tableHead}>
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tamaño</th>
                <th className="px-4 py-3">Corte</th>
                <th className="px-4 py-3">Default</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {templates.map((template) => (
                <tr key={template.id} className={adminUi.tableRow}>
                  <td className="px-4 py-3 font-medium">{template.name}</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">
                    {template.page_width_mm} × {template.page_height_mm} mm
                  </td>
                  <td className="px-4 py-3">
                    {template.cut_layer_enabled ? (
                      <span className="text-fuchsia-700">Sí</span>
                    ) : (
                      <span className="text-neutral-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {template.is_default ? (
                      <span className="rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
                        default
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(template)}
                        className={adminUi.editBtn}
                      >
                        Editar
                      </button>
                      <a
                        href={`/api/admin/print-templates/${template.id}?format=preview`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
                      >
                        <Download className="h-3 w-3" />
                        Preview
                      </a>
                      {!template.is_default && (
                        <button
                          type="button"
                          onClick={() => void handleDelete(template.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          Borrar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
