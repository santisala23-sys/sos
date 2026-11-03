import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import {
  deleteStoreProduct,
  findStoreProductById,
  updateStoreProduct,
} from "@/lib/db/queries-store";
import { isStoreProductType } from "@/lib/store/product-types";
import { resolveStoreProductMedia } from "@/lib/store/gallery-urls";
import { parseStoreProductPricePayload } from "@/lib/store/store-pricing";

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
      price_pesos?: string;
      price_label?: string;
      discount_percent?: number | null;
      image_url?: string | null;
      gallery_urls_text?: string;
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

    const media =
      body.gallery_urls_text !== undefined || body.image_url !== undefined
        ? resolveStoreProductMedia({
            image_url: body.image_url,
            gallery_urls_text: body.gallery_urls_text,
          })
        : null;

    let pricePatch: Partial<ReturnType<typeof parseStoreProductPricePayload>> = {};
    if (
      body.price_pesos !== undefined ||
      body.price_cents !== undefined ||
      body.price_label !== undefined ||
      body.discount_percent !== undefined
    ) {
      try {
        pricePatch = parseStoreProductPricePayload(body);
      } catch {
        return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
      }
    }

    const product = await updateStoreProduct(id, {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.product_type && isStoreProductType(body.product_type)
        ? { product_type: body.product_type }
        : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(pricePatch.price_cents !== undefined
        ? { price_cents: pricePatch.price_cents }
        : {}),
      ...(pricePatch.price_label !== undefined
        ? { price_label: pricePatch.price_label }
        : {}),
      ...(pricePatch.discount_percent !== undefined
        ? { discount_percent: pricePatch.discount_percent }
        : {}),
      ...(media
        ? { image_url: media.image_url, gallery_urls: media.gallery_urls }
        : {}),
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
