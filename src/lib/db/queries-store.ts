import { getSql } from "@/lib/db/index";
import { slugify } from "@/lib/utils/slug";
import type { StoreOrderStatus, StoreProductType } from "@/lib/store/product-types";
import { isStoreOrderStatus, isStoreProductType } from "@/lib/store/product-types";

export type StoreProductRow = {
  id: string;
  name: string;
  slug: string;
  product_type: StoreProductType;
  description: string;
  price_cents: number | null;
  price_label: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StoreOrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_type: string;
  quantity: number;
  unit_price_label: string;
  created_at: string;
};

export type StoreOrderRow = {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string | null;
  customer_notes: string | null;
  status: StoreOrderStatus;
  created_at: string;
  updated_at: string;
  items?: StoreOrderItemRow[];
  user_email?: string | null;
};

export async function listActiveStoreProducts(): Promise<StoreProductRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, name, slug, product_type, description, price_cents, price_label,
      image_url, sort_order, is_active, created_at, updated_at
    FROM store_products
    WHERE is_active = TRUE
    ORDER BY sort_order ASC, name ASC
  `;
  return rows as StoreProductRow[];
}

export async function listAllStoreProducts(): Promise<StoreProductRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, name, slug, product_type, description, price_cents, price_label,
      image_url, sort_order, is_active, created_at, updated_at
    FROM store_products
    ORDER BY sort_order ASC, name ASC
  `;
  return rows as StoreProductRow[];
}

export async function findStoreProductById(
  id: string,
): Promise<StoreProductRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, name, slug, product_type, description, price_cents, price_label,
      image_url, sort_order, is_active, created_at, updated_at
    FROM store_products
    WHERE id = ${id}
    LIMIT 1
  `;
  return (rows[0] as StoreProductRow | undefined) ?? null;
}

export async function createStoreProduct(input: {
  name: string;
  product_type: StoreProductType;
  description?: string;
  price_cents?: number | null;
  price_label?: string;
  image_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
}): Promise<StoreProductRow> {
  const sql = getSql();
  const baseSlug = slugify(input.name) || "producto";
  let slug = baseSlug;
  let attempt = 0;

  while (attempt < 5) {
    try {
      const rows = await sql`
        INSERT INTO store_products (
          name, slug, product_type, description, price_cents, price_label,
          image_url, sort_order, is_active
        )
        VALUES (
          ${input.name.trim()},
          ${slug},
          ${input.product_type},
          ${input.description?.trim() ?? ""},
          ${input.price_cents ?? null},
          ${input.price_label?.trim() || "Consultar"},
          ${input.image_url?.trim() || null},
          ${input.sort_order ?? 0},
          ${input.is_active ?? true}
        )
        RETURNING
          id, name, slug, product_type, description, price_cents, price_label,
          image_url, sort_order, is_active, created_at, updated_at
      `;
      return rows[0] as StoreProductRow;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (!msg.includes("unique") && !msg.includes("duplicate")) throw error;
      attempt++;
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    }
  }
  throw new Error("No se pudo generar slug único");
}

export async function updateStoreProduct(
  id: string,
  input: Partial<{
    name: string;
    product_type: StoreProductType;
    description: string;
    price_cents: number | null;
    price_label: string;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
  }>,
): Promise<StoreProductRow | null> {
  const existing = await findStoreProductById(id);
  if (!existing) return null;

  const sql = getSql();
  const rows = await sql`
    UPDATE store_products
    SET
      name = ${input.name?.trim() ?? existing.name},
      product_type = ${input.product_type ?? existing.product_type},
      description = ${input.description !== undefined ? input.description.trim() : existing.description},
      price_cents = ${input.price_cents !== undefined ? input.price_cents : existing.price_cents},
      price_label = ${input.price_label?.trim() ?? existing.price_label},
      image_url = ${input.image_url !== undefined ? input.image_url?.trim() || null : existing.image_url},
      sort_order = ${input.sort_order ?? existing.sort_order},
      is_active = ${input.is_active ?? existing.is_active},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id, name, slug, product_type, description, price_cents, price_label,
      image_url, sort_order, is_active, created_at, updated_at
  `;
  return (rows[0] as StoreProductRow | undefined) ?? null;
}

export async function deleteStoreProduct(id: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    DELETE FROM store_products WHERE id = ${id} RETURNING id
  `;
  return rows.length > 0;
}

export async function listStoreOrders(limit = 100): Promise<StoreOrderRow[]> {
  const sql = getSql();
  const orders = await sql`
    SELECT
      o.id, o.user_id, o.customer_name, o.customer_email, o.customer_phone,
      o.shipping_address, o.customer_notes, o.status, o.created_at, o.updated_at,
      u.email AS user_email
    FROM store_orders o
    LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC
    LIMIT ${limit}
  `;

  const result: StoreOrderRow[] = [];
  for (const order of orders as StoreOrderRow[]) {
    const items = await listStoreOrderItems(order.id);
    result.push({ ...order, items });
  }
  return result;
}

export async function findStoreOrderById(id: string): Promise<StoreOrderRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      o.id, o.user_id, o.customer_name, o.customer_email, o.customer_phone,
      o.shipping_address, o.customer_notes, o.status, o.created_at, o.updated_at,
      u.email AS user_email
    FROM store_orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.id = ${id}
    LIMIT 1
  `;
  const order = rows[0] as StoreOrderRow | undefined;
  if (!order) return null;
  const items = await listStoreOrderItems(order.id);
  return { ...order, items };
}

async function listStoreOrderItems(orderId: string): Promise<StoreOrderItemRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, order_id, product_id, product_name, product_type,
      quantity, unit_price_label, created_at
    FROM store_order_items
    WHERE order_id = ${orderId}
    ORDER BY created_at ASC
  `;
  return rows as StoreOrderItemRow[];
}

export async function updateStoreOrderStatus(
  id: string,
  status: StoreOrderStatus,
): Promise<StoreOrderRow | null> {
  if (!isStoreOrderStatus(status)) return null;
  const sql = getSql();
  const rows = await sql`
    UPDATE store_orders
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id, user_id, customer_name, customer_email, customer_phone,
      shipping_address, customer_notes, status, created_at, updated_at
  `;
  const order = rows[0] as StoreOrderRow | undefined;
  if (!order) return null;
  const items = await listStoreOrderItems(order.id);
  return { ...order, items };
}

export async function createStoreOrder(input: {
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address?: string | null;
  customer_notes?: string | null;
  items: { product_id: string; quantity: number }[];
}): Promise<StoreOrderRow> {
  if (input.items.length === 0) {
    throw new Error("El pedido debe incluir al menos un producto");
  }

  const sql = getSql();
  const orderRows = await sql`
    INSERT INTO store_orders (
      user_id, customer_name, customer_email, customer_phone,
      shipping_address, customer_notes
    )
    VALUES (
      ${input.user_id ?? null},
      ${input.customer_name.trim()},
      ${input.customer_email.trim()},
      ${input.customer_phone.trim()},
      ${input.shipping_address?.trim() || null},
      ${input.customer_notes?.trim() || null}
    )
    RETURNING
      id, user_id, customer_name, customer_email, customer_phone,
      shipping_address, customer_notes, status, created_at, updated_at
  `;
  const order = orderRows[0] as StoreOrderRow;

  for (const item of input.items) {
    const product = await findStoreProductById(item.product_id);
    if (!product || !product.is_active) {
      throw new Error(`Producto no disponible: ${item.product_id}`);
    }
    if (!isStoreProductType(product.product_type)) {
      throw new Error("Tipo de producto inválido");
    }
    const qty = Math.min(Math.max(item.quantity, 1), 99);

    await sql`
      INSERT INTO store_order_items (
        order_id, product_id, product_name, product_type, quantity, unit_price_label
      )
      VALUES (
        ${order.id},
        ${product.id},
        ${product.name},
        ${product.product_type},
        ${qty},
        ${product.price_cents != null && product.price_cents > 0
          ? `$${(product.price_cents / 100).toLocaleString("es-AR")}`
          : product.price_label}
      )
    `;
  }

  const full = await findStoreOrderById(order.id);
  if (!full) throw new Error("Error al crear pedido");
  return full;
}

export async function countPendingStoreOrders(): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM store_orders WHERE status = 'pending'
  `;
  return (rows[0] as { count: number }).count ?? 0;
}
