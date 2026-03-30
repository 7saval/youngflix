import { useEffect, useState } from "react";

import { apiClient } from "@/app/api/client";

type UseWishlistParams = {
  accessToken?: string;
  enabled?: boolean;
  tmdbId: number;
};

export function useWishlist({
  accessToken,
  enabled = true,
  tmdbId,
}: UseWishlistParams) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadWishlistState = async () => {
      if (!enabled || !accessToken) {
        setIsWishlisted(false);
        setReady(true);
        return;
      }

      setLoading(true);

      try {
        const data = await apiClient.wishlist.get(accessToken, tmdbId);
        setIsWishlisted(data.wishlisted);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setReady(true);
      }
    };

    void loadWishlistState();
  }, [accessToken, enabled, tmdbId]);

  const toggleWishlist = async () => {
    if (!accessToken) {
      return false;
    }

    setLoading(true);

    try {
      const data = isWishlisted
        ? await apiClient.wishlist.remove(accessToken, tmdbId)
        : await apiClient.wishlist.add(accessToken, tmdbId);

      setIsWishlisted(data.wishlisted);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
      setReady(true);
    }
  };

  return {
    isWishlisted,
    loading,
    ready,
    toggleWishlist,
  };
}
