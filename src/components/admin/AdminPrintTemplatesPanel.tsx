"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Download,
  ImagePlus,
  LayoutTemplate,
  Layers,
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
  sanitizeTemplateLayout,
  type PrintTemplateRow,
} from "@/lib/activation/print-template-types";
import type {
  CanvasLayerItem,
  PrintTemplateCanvasHandle,
} from "@/components/admin/PrintTemplateCanvas";
import { AdminEmptyState, AdminLoading, AdminPageHeader } from "@/components/admin/AdminUiParts";
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
  const [layers, setLayers] = useState<CanvasLayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [showCutGuides, setShowCutGuides] = useState(true);

  const canvasRef = useRef<PrintTemplateCanvasHandle | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setLayers([]);
    setSelectedLayerId(null);
    setCanvasReady(false);
    setError(null);
  }

  function startEdit(template: PrintTemplateRow) {
    setEditingId(template.id);
    setName(template.name);
    setPageWidthMm(template.page_width_mm);
    setPageHeightMm(template.page_height_mm);
    setCutLayerEnabled(template.cut_layer_enabled);
    setLayout(sanitizeTemplateLayout(template.layout_json));
    setEditorKey((k) => k + 1);
    setLayers([]);
    setSelectedLayerId(null);
    setCanvasReady(false);
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
    if (!canvasReady || !canvasRef.current) {
      setError("Esperá a que cargue el lienzo antes de agregar imágenes.");
      return;
    }
    setError(null);
    try {
      const url = await uploadFile(file);
      if (!url) return;
      await canvasRef.current.addImage(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo agregar la imagen al lienzo.",
      );
    }
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const layoutJson = sanitizeTemplateLayout(
        canvasRef.current?.getLayout() ?? layout,
      );
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
              Lienzo blanco fijo. Agregá QR, texto, logos e imágenes encima. Las guías
              magenta son solo para la imprenta.
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


        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_260px]">
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
                Incluir capa de corte en el PDF (magenta)
              </label>
              <label className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  checked={showCutGuides}
                  onChange={(e) => setShowCutGuides(e.target.checked)}
                  className="rounded border-neutral-300 text-violet-600"
                />
                Mostrar guías de corte en el editor
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
                  onClick={() => canvasRef.current?.addCutRect()}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-violet-50"
                >
                  <Scissors className="h-4 w-4 text-fuchsia-600" />
                  Rectángulo de corte
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
                  Perforación (círculo)
                </button>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Seleccioná una guía de corte y arrastrá las esquinas para ajustar el tamaño.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => void handleImageUpload(e)}
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
              <button
                type="button"
                onClick={() => canvasRef.current?.deleteSelected()}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Borrar selección
              </button>
            </div>
          </aside>

          <PrintTemplateCanvas
            key={editorKey}
            pageWidthMm={pageWidthMm}
            pageHeightMm={pageHeightMm}
            layout={layout}
            showCutGuides={showCutGuides}
            canvasRef={canvasRef}
            onLayersChange={(nextLayers) => {
              setLayers(nextLayers);
              setCanvasReady(true);
            }}
            onSelectionChange={(meta) => setSelectedLayerId(meta?.sosId ?? null)}
          />

          <aside className={adminUi.formCard}>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-600" />
              <h3 className="text-sm font-semibold text-neutral-800">Capas</h3>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Arriba = al frente. El borde violeta punteado marca el tamaño final.
            </p>

            {layers.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-500">
                Sin capas. Usá los botones de la izquierda para agregar QR, texto o imágenes.
              </p>
            ) : (
              <ul className="mt-4 space-y-1.5">
                {layers.map((layer) => {
                  const isSelected = selectedLayerId === layer.id;
                  const isCut =
                    layer.type === "cut_circle" ||
                    layer.type === "cut_hole" ||
                    layer.type === "cut_rect";

                  return (
                    <li
                      key={layer.id}
                      className={`rounded-lg border px-2.5 py-2 ${
                        isSelected
                          ? "border-violet-300 bg-violet-50"
                          : "border-neutral-200 bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => canvasRef.current?.selectLayer(layer.id)}
                        className="w-full text-left text-sm font-medium text-neutral-800"
                      >
                        <span
                          className={
                            isCut ? "text-fuchsia-700" : "text-neutral-800"
                          }
                        >
                          {layer.label}
                        </span>
                      </button>
                      <div className="mt-2 flex items-center gap-1">
                          <button
                            type="button"
                            title="Subir capa"
                            onClick={() =>
                              canvasRef.current?.moveLayer(layer.id, "up")
                            }
                            className="rounded border border-neutral-200 p-1 hover:bg-neutral-50"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Bajar capa"
                            onClick={() =>
                              canvasRef.current?.moveLayer(layer.id, "down")
                            }
                            className="rounded border border-neutral-200 p-1 hover:bg-neutral-50"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Borrar capa"
                            onClick={() =>
                              canvasRef.current?.deleteLayer(layer.id)
                            }
                            className="ml-auto rounded border border-red-200 p-1 text-red-700 hover:bg-red-50"
                          >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Plantillas de imprenta"
        description="Diseños reutilizables para PDFs con QR listos para mandar a la gráfica."
        actions={
          <>
            <button
              type="button"
              onClick={() => load()}
              disabled={loading}
              className={adminUi.refreshBtn}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <button type="button" onClick={startNew} className={adminUi.primaryBtn}>
              <Plus className="h-4 w-4" />
              Nueva plantilla
            </button>
          </>
        }
      />

      {error && (
        <p className={adminUi.alertError} role="alert">
          {error}
        </p>
      )}

      {loading && templates.length === 0 ? (
        <AdminLoading label="Cargando plantillas..." />
      ) : templates.length === 0 ? (
        <AdminEmptyState>
          <LayoutTemplate className="mx-auto h-10 w-10 text-violet-400" />
          <p className="mt-3 font-medium text-neutral-700">Todavía no hay plantillas.</p>
          <button type="button" onClick={startNew} className={`mt-4 ${adminUi.primaryBtn}`}>
            Crear la primera
          </button>
        </AdminEmptyState>
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
