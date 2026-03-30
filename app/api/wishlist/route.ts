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
  tmdbId?: number;
};

type FailureResult = {
  response: Response;
};

type AuthenticatedProfileResult =
  | {
      profile: Awaited<ReturnType<typeof getOrCreateUserProfile>>;
    }
  | FailureResult;

type TmdbIdResult =
  | {
      tmdbId: number;
    }
  | FailureResult;

type WishlistHandler = (request: Request) => Promise<Response>;

// 응답 헬퍼: 실패 응답 생성과 예외 처리 래퍼를 담당한다.
function createFailureResponse(error: string, status: number) {
  const response: ApiFailure = {
    ok: false,
    error,
  };

  return NextResponse.json(response, { status });
}

function withErrorHandling(handler: WishlistHandler): WishlistHandler {
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error("Failed to handle wishlist request.", error);
      return createFailureResponse("Failed to process wishlist request.", 500);
    }
  };
}

// 인증 헬퍼: Authorization 헤더에서 토큰을 읽고 사용자 프로필을 확인한다.
async function getAuthenticatedProfile(
  request: Request,
): Promise<AuthenticatedProfileResult> {
  const accessToken = getAccessTokenFromAuthorizationHeader(request);

  if (!accessToken) {
    return {
      response: createFailureResponse("Missing access token.", 400),
    };
  }

  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser(accessToken);

  if (error || !user) {
    return {
      response: createFailureResponse("Unauthorized user.", 401),
    };
  }

  return {
    profile: await getOrCreateUserProfile(user),
  };
}

function getAccessTokenFromAuthorizationHeader(request: Request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim() || null;
}

// 요청 검증 헬퍼: tmdbId를 요청 위치에 맞게 읽고 형식을 검증한다.
function getTmdbIdFromSearchParams(request: Request): TmdbIdResult {
  const { searchParams } = new URL(request.url);
  const tmdbId = Number(searchParams.get("tmdbId"));

  if (!Number.isInteger(tmdbId)) {
    return {
      response: createFailureResponse("Invalid tmdbId.", 400),
    };
  }

  return { tmdbId };
}

async function getTmdbIdFromBody(request: Request): Promise<TmdbIdResult> {
  const body = (await request.json()) as WishlistBody;
  const tmdbId = body.tmdbId;

  if (typeof tmdbId !== "number" || !Number.isInteger(tmdbId)) {
    return {
      response: createFailureResponse("Invalid tmdbId.", 400),
    };
  }

  return { tmdbId };
}

// 라우트 핸들러: 검증이 끝난 입력으로 위시리스트 조회/추가/삭제만 수행한다.
export const GET = withErrorHandling(async (request: Request): Promise<Response> => {
  const authResult = await getAuthenticatedProfile(request);

  if ("response" in authResult) {
    return authResult.response;
  }

  const tmdbIdResult = getTmdbIdFromSearchParams(request);

  if ("response" in tmdbIdResult) {
    return tmdbIdResult.response;
  }

  const wishlisted = await isMovieWishlisted(
    authResult.profile.id,
    tmdbIdResult.tmdbId,
  );

  const response: WishlistStateResponse = {
    ok: true,
    wishlisted,
  };

  return NextResponse.json(response);
});

export const POST = withErrorHandling(async (request: Request): Promise<Response> => {
  const authResult = await getAuthenticatedProfile(request);

  if ("response" in authResult) {
    return authResult.response;
  }

  const tmdbIdResult = await getTmdbIdFromBody(request);

  if ("response" in tmdbIdResult) {
    return tmdbIdResult.response;
  }

  await addWishlistItem(authResult.profile.id, tmdbIdResult.tmdbId);

  const response: WishlistStateResponse = {
    ok: true,
    wishlisted: true,
  };

  return NextResponse.json(response);
});

export const DELETE = withErrorHandling(async (request: Request): Promise<Response> => {
  const authResult = await getAuthenticatedProfile(request);

  if ("response" in authResult) {
    return authResult.response;
  }

  const tmdbIdResult = await getTmdbIdFromBody(request);

  if ("response" in tmdbIdResult) {
    return tmdbIdResult.response;
  }

  await removeWishlistItem(authResult.profile.id, tmdbIdResult.tmdbId);

  const response: WishlistStateResponse = {
    ok: true,
    wishlisted: false,
  };

  return NextResponse.json(response);
});
