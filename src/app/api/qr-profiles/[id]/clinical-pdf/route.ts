import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  clearClinicalPdf,
  getClinicalPdfForTutor,
  setClinicalPdf,
} from "@/lib/db/queries";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ id: string }> };

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const pdf = await getClinicalPdfForTutor(id, session.userId);

  if (!pdf) {
    return NextResponse.json({ error: "PDF no encontrado" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(pdf.data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdf.filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const contentType = request.headers.get("content-type") ?? "";
    let base64Data: string;
    let filename: string;

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as {
        data?: string;
        filename?: string;
      };
      if (!body.data?.trim()) {
        return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
      }
      base64Data = body.data;
      filename = body.filename?.trim() || "historial-clinico.pdf";
    } else {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
      }

      if (!isPdfFile(file)) {
        return NextResponse.json(
          { error: "Solo se permiten archivos PDF" },
          { status: 400 },
        );
      }

      base64Data = Buffer.from(await file.arrayBuffer()).toString("base64");
      filename = file.name || "historial-clinico.pdf";
    }

    const profile = await setClinicalPdf(
      id,
      session.userId,
      base64Data,
      filename,
    );

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al subir el PDF";
    console.error("[clinical-pdf POST]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const profile = await clearClinicalPdf(id, session.userId);

  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}
