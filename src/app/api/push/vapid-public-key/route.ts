import { NextResponse } from "next/server";
import webpush from "web-push";
import {
  getServerVapidPrivateKey,
  getServerVapidPublicKey,
  getVapidSubject,
} from "@/lib/push/vapid";

export const dynamic = "force-dynamic";

function isVapidHealthy(): boolean {
  const publicKey = getServerVapidPublicKey();
  const privateKey = getServerVapidPrivateKey();
  const subject = getVapidSubject();

  if (!publicKey || !privateKey) return false;

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const publicKey = getServerVapidPublicKey();
  const configured = Boolean(publicKey && getServerVapidPrivateKey());
  const healthy = configured ? isVapidHealthy() : false;

  return NextResponse.json({ publicKey, configured, healthy });
}
