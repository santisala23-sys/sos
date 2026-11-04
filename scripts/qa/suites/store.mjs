import { admin } from "../fixtures.mjs";

const CUSTOMER = {
  customer_name: "Cliente QA",
  customer_email: "cliente@qa.test",
  customer_phone: "+5491100001111",
  shipping_address: "Av. Siempre Viva 742",
};

export default async function store(ctx) {
  const anon = ctx.client();
  let products = [];

  await ctx.check("El catálogo público lista productos activos con precio", async () => {
    const res = await anon.get("/api/store/orders");
    ctx.expectStatus(res, 200);
    products = res.json.products;
    ctx.expect(products.length > 0, "catálogo vacío");
    return { note: products.map((p) => `${p.name} (${p.price_label ?? p.price_cents ?? "s/p"})`).join(", ").slice(0, 250) };
  }, { severity: "high" });

  await ctx.check("La home muestra el catálogo", async () => {
    const res = await anon.get("/");
    const shown = products.filter((p) => res.text.includes(p.name));
    const hidden = products.filter((p) => !res.text.includes(p.name));
    ctx.expect(shown.length > 0, "la home no muestra ningún producto activo");
    if (hidden.length) {
      return {
        warn: `la home muestra solo ${shown.map((p) => p.name).join(" y ")}; quedan activos pero fuera de la home: ${hidden.map((p) => p.name).join(", ")} (withStoreCatalogFallback fija los slugs collar-qr-hueso / collar-qr-patita, así que un producto nuevo del admin no aparece)`,
      };
    }
  }, { severity: "medium" });

  let orderId = null;
  await ctx.check("Pedido válido se registra (201)", async () => {
    const res = await anon.post("/api/store/orders", { ...CUSTOMER, items: [{ product_id: products[0].id, quantity: 2 }] });
    ctx.expectStatus(res, 201);
    orderId = res.json.order.id;
  }, { severity: "critical" });

  await ctx.check("Pedido inválido se rechaza (email, sin ítems, cantidad 0 o negativa, producto inexistente)", async () => {
    const pid = products[0].id;
    const cases = [
      [{ ...CUSTOMER, customer_email: "no-es-mail", items: [{ product_id: pid, quantity: 1 }] }, "email"],
      [{ ...CUSTOMER, items: [] }, "sin ítems"],
      [{ ...CUSTOMER, items: [{ product_id: "00000000-0000-4000-8000-000000000000", quantity: 1 }] }, "producto inexistente"],
      [{ ...CUSTOMER, customer_name: "", items: [{ product_id: pid, quantity: 1 }] }, "sin nombre"],
    ];
    const accepted = [];
    for (const [body, label] of cases) {
      const res = await ctx.client().post("/api/store/orders", body);
      if (res.status === 201) {
        const items = await ctx.sql("SELECT quantity FROM store_order_items WHERE order_id = $1", [res.json.order.id]).catch(() => []);
        accepted.push(`${label} (guardado con cantidad ${items.map((i) => i.quantity).join(",") || "?"})`);
      } else ctx.expect(res.status === 400, `${label}: HTTP ${res.status}`);
    }
    ctx.expect(accepted.length === 0, `se aceptaron pedidos inválidos: ${accepted.join(", ")}`);
  }, { severity: "high" });

  await ctx.check("Cantidad 0 o negativa no genera un pedido con cantidad inválida", async () => {
    const stored = [];
    for (const quantity of [0, -3]) {
      const res = await ctx.client().post("/api/store/orders", { ...CUSTOMER, items: [{ product_id: products[0].id, quantity }] });
      if (res.status !== 201) continue;
      const items = await ctx.sql("SELECT quantity FROM store_order_items WHERE order_id = $1", [res.json.order.id]);
      ctx.expect(items.every((i) => i.quantity >= 1), `quedó guardado con cantidad ${items.map((i) => i.quantity)}`);
      stored.push(`${quantity}→${items.map((i) => i.quantity).join(",")}`);
    }
    if (stored.length) return { warn: `se aceptan y se corrigen a 1 (${stored.join(", ")}); sería más claro rechazarlas` };
  }, { severity: "low" });

  await ctx.check("Cantidades absurdas (10 000 unidades)", async () => {
    const res = await ctx.client().post("/api/store/orders", { ...CUSTOMER, items: [{ product_id: products[0].id, quantity: 10000 }] });
    if (res.status === 201) return { warn: "aceptó un pedido de 10 000 unidades; conviene un tope" };
  }, { severity: "low" });

  await ctx.check("El precio no se puede manipular desde el cliente", async () => {
    const res = await ctx.client().post("/api/store/orders", { ...CUSTOMER, items: [{ product_id: products[0].id, quantity: 1, price_cents: 1, unit_price_cents: 1 }], total_cents: 1 });
    ctx.expectStatus(res, 201);
    const total = JSON.stringify(res.json.order);
    ctx.expect(!/"(total_cents|unit_price_cents)":1\b/.test(total), `el pedido tomó el precio del cliente: ${total.slice(0, 200)}`);
  }, { severity: "critical" });

  await ctx.check("Admin ve el pedido y le cambia el estado", async () => {
    const a = await admin(ctx);
    const list = await a.client.get("/api/admin/store-orders");
    ctx.expectStatus(list, 200, "listar");
    ctx.expect(list.json.orders.some((o) => o.id === orderId), "el pedido no aparece");
    ctx.expectStatus(await a.client.patch(`/api/admin/store-orders/${orderId}`, { status: "contacted" }), 200, "cambiar estado");
    ctx.expectStatus(await a.client.patch(`/api/admin/store-orders/${orderId}`, { status: "pagado-ya" }), 400, "estado inválido");
  }, { severity: "high" });

  await ctx.check("Avisos de pedido nuevo (mail al equipo)", async () => {
    const mails = await ctx.mails();
    const notice = mails.find((m) => /pedido/i.test(m.subject));
    if (!notice) return { warn: "un pedido nuevo no genera ningún mail (ni al equipo ni al cliente); solo queda en el panel de admin" };
    return { note: `«${notice.subject}» → ${notice.to.join(", ")}` };
  }, { severity: "low" });
}
