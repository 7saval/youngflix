import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";
import { getOrCreateUserProfile } from "@/lib/user-profile";
import {
  addWishlistItem,
  isMovieWishlisted,
  removeWishlistItem,
} from "@/lib/wishlist";
import type { ApiFailure, WishlistStateResponse } from "@/types/api";

type WishlistBody = {
  accessToken?: string;
  tmdbId?: number;
};

type AuthenticatedProfileResult =
  | {
      profile: Awaited<ReturnType<typeof getOrCreateUserProfile>>;
    }
  | {
      error: string;
      status: 400 | 401;
    };

async function getAuthenticatedProfile(
  accessToken: string,
): Promise<AuthenticatedProfileResult> {
  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser(accessToken);

  if (error || !user) {
    return { error: "Unauthorized user.", status: 401 as const };
  }

  return {
    profile: await getOrCreateUserProfile(user),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("accessToken");
  const tmdbId = Number(searchParams.get("tmdbId"));

  if (!accessToken) {
    const response: ApiFailure = {
      ok: false,
      error: "Missing access token.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  if (!Number.isInteger(tmdbId)) {
    const response: ApiFailure = {
      ok: false,
      error: "Invalid tmdbId.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  const authResult = await getAuthenticatedProfile(accessToken);

  if ("error" in authResult) {
    const response: ApiFailure = {
      ok: false,
      error: authResult.error,
    };

    return NextResponse.json(response, { status: authResult.status });
  }

  const wishlisted = await isMovieWishlisted(authResult.profile.id, tmdbId);

  const response: WishlistStateResponse = {
    ok: true,
    wishlisted,
  };

  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const body = (await request.json()) as WishlistBody;
  const accessToken = body.accessToken;
  const tmdbId = body.tmdbId;

  if (!accessToken) {
    const response: ApiFailure = {
      ok: false,
      error: "Missing access token.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  if (typeof tmdbId !== "number" || !Number.isInteger(tmdbId)) {
    const response: ApiFailure = {
      ok: false,
      error: "Invalid tmdbId.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  const authResult = await getAuthenticatedProfile(accessToken);

  if ("error" in authResult) {
    const response: ApiFailure = {
      ok: false,
      error: authResult.error,
    };

    return NextResponse.json(response, { status: authResult.status });
  }

  await addWishlistItem(authResult.profile.id, tmdbId);

  const response: WishlistStateResponse = {
    ok: true,
    wishlisted: true,
  };

  return NextResponse.json(response);
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as WishlistBody;
  const accessToken = body.accessToken;
  const tmdbId = body.tmdbId;

  if (!accessToken) {
    const response: ApiFailure = {
      ok: false,
      error: "Missing access token.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  if (typeof tmdbId !== "number" || !Number.isInteger(tmdbId)) {
    const response: ApiFailure = {
      ok: false,
      error: "Invalid tmdbId.",
    };

    return NextResponse.json(response, { status: 400 });
  }

  const authResult = await getAuthenticatedProfile(accessToken);

  if ("error" in authResult) {
    const response: ApiFailure = {
      ok: false,
      error: authResult.error,
    };

    return NextResponse.json(response, { status: authResult.status });
  }

  await removeWishlistItem(authResult.profile.id, tmdbId);

  const response: WishlistStateResponse = {
    ok: true,
    wishlisted: false,
  };

  return NextResponse.json(response);
}
