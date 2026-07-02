import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import {
  deleteStoreProduct,
  findStoreProductById,
  updateStoreProduct,
} from "@/lib/db/queries-store";
import { isStoreProductType } from "@/lib/store/product-types";

export const PATCH = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request, context) => {
    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    let body: {
      name?: string;
      product_type?: string;
      description?: string;
      price_cents?: number | null;
      price_label?: string;
      image_url?: string | null;
      sort_order?: number;
      is_active?: boolean;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    if (body.product_type && !isStoreProductType(body.product_type)) {
      return NextResponse.json({ error: "Tipo de producto inválido" }, { status: 400 });
    }

    const product = await updateStoreProduct(id, {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.product_type && isStoreProductType(body.product_type)
        ? { product_type: body.product_type }
        : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.price_cents !== undefined ? { price_cents: body.price_cents } : {}),
      ...(body.price_label !== undefined ? { price_label: body.price_label } : {}),
      ...(body.image_url !== undefined ? { image_url: body.image_url } : {}),
      ...(body.sort_order !== undefined ? { sort_order: body.sort_order } : {}),
      ...(body.is_active !== undefined ? { is_active: body.is_active } : {}),
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ product });
  },
);

export const DELETE = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (_request, context) => {
    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const existing = await findStoreProductById(id);
    if (!existing) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    await deleteStoreProduct(id);
    return NextResponse.json({ ok: true });
  },
);
