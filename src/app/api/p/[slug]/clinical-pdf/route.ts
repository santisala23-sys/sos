import { NextResponse } from "next/server";
import { getClinicalPdfBySlug } from "@/lib/db/queries";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const pdf = await getClinicalPdfBySlug(slug);

  if (!pdf) {
    return NextResponse.json({ error: "PDF no disponible" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(pdf.data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdf.filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
