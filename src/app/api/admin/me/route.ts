import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { isUserAdmin } from "@/lib/auth/admin";

export const GET = withApi(
  { rateLimit: "api" },
  async (_request, _ctx, meta) => {
    if (!meta.userId) {
      return NextResponse.json({ isAdmin: false });
    }
    const isAdmin = await isUserAdmin(meta.userId);
    return NextResponse.json({ isAdmin });
  },
);
