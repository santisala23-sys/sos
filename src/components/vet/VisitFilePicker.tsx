"use client";

import { FileText, ImageIcon, X } from "lucide-react";

export type PendingVisitFile = {
  filename: string;
  mime: string;
  data: string;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,application/pdf";
const MAX_FILES = 3;
const MAX_BYTES = 3 * 1024 * 1024;

type VisitFilePickerProps = {
  files: PendingVisitFile[];
  onChange: (files: PendingVisitFile[]) => void;
  accent?: "violet" | "teal";
};

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

export function VisitFilePicker({
  files,
  onChange,
  accent = "violet",
}: VisitFilePickerProps) {
  const focusRing =
    accent === "teal"
      ? "focus:border-teal-500 focus:ring-teal-500/20"
      : "focus:border-violet-500 focus:ring-violet-500/20";

  async function onPick(list: FileList | null) {
    if (!list?.length) return;
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_FILES) break;
      if (file.size > MAX_BYTES) {
        window.alert(`"${file.name}" supera 3 MB`);
        continue;
      }
      const mime = file.type || "application/octet-stream";
      if (!ACCEPT.split(",").includes(mime)) {
        window.alert(`"${file.name}" no es una imagen o PDF permitido`);
        continue;
      }
      try {
        const data = await readFileAsBase64(file);
        next.push({ filename: file.name, mime, data });
      } catch {
        window.alert(`No se pudo leer "${file.name}"`);
      }
    }
    onChange(next.slice(0, MAX_FILES));
  }

  return (
    <div>
      <label className="text-sm font-semibold text-neutral-700">
        Archivos{" "}
        <span className="font-normal text-neutral-400">
          (opcional · imágenes o PDF · máx. 3 · 3 MB c/u)
        </span>
      </label>
      <input
        type="file"
        accept={ACCEPT}
        multiple
        onChange={(e) => {
          void onPick(e.target.files);
          e.target.value = "";
        }}
        className={`mt-1 block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-neutral-800 hover:file:bg-neutral-200 ${focusRing}`}
      />
      {files.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {files.map((file, idx) => (
            <li
              key={`${file.filename}-${idx}`}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
            >
              {file.mime === "application/pdf" ? (
                <FileText className="h-4 w-4 shrink-0 text-rose-600" aria-hidden />
              ) : (
                <ImageIcon className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
              )}
              <span className="min-w-0 flex-1 truncate text-neutral-800">
                {file.filename}
              </span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, i) => i !== idx))}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                aria-label={`Quitar ${file.filename}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
