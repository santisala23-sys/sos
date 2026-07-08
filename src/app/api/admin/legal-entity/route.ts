import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import {
  getLegalEntitySettings,
  updateLegalEntitySettings,
} from "@/lib/db/queries-legal-entity";
import { isLegalEntityComplete } from "@/lib/legal/entity-settings";

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async () => {
    const settings = await getLegalEntitySettings();
    return NextResponse.json({
      settings,
      complete: isLegalEntityComplete(settings),
    });
  },
);

export const PATCH = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request) => {
    let body: {
      legal_name?: string | null;
      cuit?: string | null;
      address?: string | null;
      jurisdiction?: string | null;
      privacy_email?: string | null;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const normalize = (value: string | null | undefined) => {
      if (value === undefined) return undefined;
      const trimmed = value?.trim() ?? "";
      return trimmed.length > 0 ? trimmed : null;
    };

    const settings = await updateLegalEntitySettings({
      legal_name: normalize(body.legal_name),
      cuit: normalize(body.cuit),
      address: normalize(body.address),
      jurisdiction: normalize(body.jurisdiction),
      privacy_email: normalize(body.privacy_email),
    });

    return NextResponse.json({
      settings,
      complete: isLegalEntityComplete(settings),
    });
  },
);
