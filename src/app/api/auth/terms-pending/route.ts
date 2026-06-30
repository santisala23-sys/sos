import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { termsPendingCookieOptions } from "@/lib/legal/terms-cookie";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(termsPendingCookieOptions());
  return NextResponse.json({ ok: true });
}
