import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { updateStoreOrderStatus } from "@/lib/db/queries-store";
import { isStoreOrderStatus } from "@/lib/store/product-types";

export const PATCH = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request, context) => {
    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    let body: { status?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    if (!body.status || !isStoreOrderStatus(body.status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const order = await updateStoreOrderStatus(id, body.status);
    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ order });
  },
);
