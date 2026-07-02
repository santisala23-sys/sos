import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { withApi } from "@/lib/api/with-api";
import { createStoreOrder, listActiveStoreProducts } from "@/lib/db/queries-store";

export const GET = withApi({ rateLimit: "api" }, async () => {
  const products = await listActiveStoreProducts();
  return NextResponse.json({ products });
});

export const POST = withApi({ rateLimit: "api" }, async (request, _context, meta) => {
  let body: {
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    shipping_address?: string;
    customer_notes?: string;
    items?: { product_id: string; quantity: number }[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const customer_name = body.customer_name?.trim();
  const customer_email = body.customer_email?.trim();
  const customer_phone = body.customer_phone?.trim();

  if (!customer_name || !customer_email || !customer_phone) {
    return NextResponse.json(
      { error: "Completá nombre, email y teléfono" },
      { status: 400 },
    );
  }

  if (!body.items?.length) {
    return NextResponse.json(
      { error: "Seleccioná al menos un producto" },
      { status: 400 },
    );
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email);
  if (!emailOk) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const session = await getSession();

  try {
    const order = await createStoreOrder({
      user_id: meta.userId ?? session?.userId ?? null,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address: body.shipping_address,
      customer_notes: body.customer_notes,
      items: body.items,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear pedido";
    console.error("[store orders POST]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
});
