import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { listStoreOrders } from "@/lib/db/queries-store";

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request) => {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 100), 500);
    const orders = await listStoreOrders(limit);
    return NextResponse.json({ orders });
  },
);
