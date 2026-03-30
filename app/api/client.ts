type RequestOptions = {
  body?: unknown;
  method?: "GET" | "POST" | "DELETE";
  query?: Record<string, string>;
  headers?: Record<string, string>;
};

import type {
  ApiFailure,
  SyncUserProfileResponse,
  WishlistStateResponse,
} from "@/types/api";

async function request<T>(
  path: string,
  { body, method = "GET", query, headers }: RequestOptions = {},
): Promise<T> {
  const url = new URL(path, window.location.origin);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      ...(body !== undefined
        ? {
            "Content-Type": "application/json",
          }
        : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = (await response.json()) as T | ApiFailure;

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : "Unexpected API error.";

    throw new Error(errorMessage);
  }

  return data as T;
}

function createAuthorizationHeader(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export const apiClient = {
  userProfile: {
    sync(accessToken: string) {
      return request<SyncUserProfileResponse>("/api/user-profile/sync", {
        method: "POST",
        headers: createAuthorizationHeader(accessToken),
      });
    },
  },
  wishlist: {
    get(accessToken: string, tmdbId: number) {
      return request<WishlistStateResponse>("/api/wishlist", {
        query: {
          tmdbId: String(tmdbId),
        },
        headers: createAuthorizationHeader(accessToken),
      });
    },
    add(accessToken: string, tmdbId: number) {
      return request<WishlistStateResponse>("/api/wishlist", {
        method: "POST",
        body: {
          tmdbId,
        },
        headers: createAuthorizationHeader(accessToken),
      });
    },
    remove(accessToken: string, tmdbId: number) {
      return request<WishlistStateResponse>("/api/wishlist", {
        method: "DELETE",
        body: {
          tmdbId,
        },
        headers: createAuthorizationHeader(accessToken),
      });
    },
  },
};
