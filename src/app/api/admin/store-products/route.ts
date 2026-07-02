import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import {
  createStoreProduct,
  deleteStoreProduct,
  listAllStoreProducts,
  updateStoreProduct,
} from "@/lib/db/queries-store";
import { isStoreProductType } from "@/lib/store/product-types";

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async () => {
    const products = await listAllStoreProducts();
    return NextResponse.json({ products });
  },
);

export const POST = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request) => {
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

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const productType = body.product_type ?? "otro";
    if (!isStoreProductType(productType)) {
      return NextResponse.json({ error: "Tipo de producto inválido" }, { status: 400 });
    }

    try {
      const product = await createStoreProduct({
        name,
        product_type: productType,
        description: body.description,
        price_cents: body.price_cents,
        price_label: body.price_label,
        image_url: body.image_url,
        sort_order: body.sort_order,
        is_active: body.is_active,
      });
      return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
      console.error("[store-products POST]", error);
      return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
    }
  },
);
