import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import {
  listAdminProfiles,
  type ListAdminProfilesFilters,
} from "@/lib/db/queries";
import { isProfileType } from "@/lib/profile-types";

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request) => {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 200), 500);
    const offset = Number(searchParams.get("offset") ?? 0);

    const activeParam = searchParams.get("is_active");
    const typeParam = searchParams.get("profile_type");
    const sourceParam = searchParams.get("source");

    const filters: ListAdminProfilesFilters = {
      q: searchParams.get("q") ?? undefined,
      isActive:
        activeParam === "1" || activeParam === "true"
          ? true
          : activeParam === "0" || activeParam === "false"
            ? false
            : null,
      profileType:
        typeParam && isProfileType(typeParam) ? typeParam : null,
      source:
        sourceParam === "product" || sourceParam === "digital"
          ? sourceParam
          : "all",
    };

    const profiles = await listAdminProfiles(limit, offset, filters);
    return NextResponse.json({ profiles });
  },
);
