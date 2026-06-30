import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  eligiblePendingCookieOptions,
  termsPendingCookieOptions,
} from "@/lib/legal/terms-cookie";

export async function POST(request: Request) {
  let declaredEligible = false;

  try {
    const body = (await request.json()) as { declaredEligible?: boolean };
    declaredEligible = Boolean(body.declaredEligible);
  } catch {
    /* login flow: solo términos */
  }

  const cookieStore = await cookies();
  cookieStore.set(termsPendingCookieOptions());

  if (declaredEligible) {
    cookieStore.set(eligiblePendingCookieOptions());
  }

  return NextResponse.json({ ok: true });
}
