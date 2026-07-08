import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import {
  createProductBatch,
  getActivationStats,
  listProductBatches,
} from "@/lib/db/queries-activation";

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async () => {
    const [batches, stats] = await Promise.all([
      listProductBatches(),
      getActivationStats(),
    ]);
    return NextResponse.json({ batches, stats });
  },
);

export const POST = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request) => {
    let body: {
      partner_name?: string;
      product_label?: string;
      notes?: string;
      quantity?: number;
      template_id?: string | null;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const partner_name = body.partner_name?.trim();
    if (!partner_name) {
      return NextResponse.json(
        { error: "El nombre del partner es obligatorio" },
        { status: 400 },
      );
    }

    const quantity = Number(body.quantity ?? 1);
    if (!Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: "La cantidad debe ser al menos 1" },
        { status: 400 },
      );
    }

    try {
      const result = await createProductBatch({
        partner_name,
        product_label: body.product_label?.trim() || null,
        notes: body.notes?.trim() || null,
        quantity,
        template_id: body.template_id ?? null,
      });
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      console.error("[product-batches POST]", error);
      return NextResponse.json({ error: "Error al crear lote" }, { status: 500 });
    }
  },
);
