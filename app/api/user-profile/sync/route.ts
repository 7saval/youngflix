import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";
import { getOrCreateUserProfile } from "@/lib/user-profile";
import type { ApiFailure, SyncUserProfileResponse } from "@/types/api";

function getAccessTokenFromAuthorizationHeader(request: Request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim() || null;
}

export async function POST(request: Request) {
  try {
    const accessToken = getAccessTokenFromAuthorizationHeader(request);

    if (!accessToken) {
      const response: ApiFailure = {
        ok: false,
        error: "Missing access token.",
      };

      return NextResponse.json(response, { status: 400 });
    }

    const {
      data: { user },
      error,
    } = await supabaseServer.auth.getUser(accessToken);

    if (error || !user) {
      const response: ApiFailure = {
        ok: false,
        error: "Unauthorized user.",
      };

      return NextResponse.json(response, { status: 401 });
    }

    const profile = await getOrCreateUserProfile(user);

    const response: SyncUserProfileResponse = {
      ok: true,
      profile: {
        id: profile.id,
        supabaseUserId: profile.supabaseUserId,
        email: profile.email,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to sync user profile.", error);

    const response: ApiFailure = {
      ok: false,
      error: "Failed to sync user profile.",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
