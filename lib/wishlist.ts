import { prisma } from "@/lib/prisma";

export async function isMovieWishlisted(userId: string, tmdbId: number) {
  const wishlistItem = await prisma.wishlist.findUnique({
    where: {
      userId_tmdbId: {
        userId,
        tmdbId,
      },
    },
  });

  return Boolean(wishlistItem);
}

export async function addWishlistItem(userId: string, tmdbId: number) {
  return prisma.wishlist.upsert({
    where: {
      userId_tmdbId: {
        userId,
        tmdbId,
      },
    },
    update: {},
    create: {
      userId,
      tmdbId,
    },
  });
}

export async function removeWishlistItem(userId: string, tmdbId: number) {
  return prisma.wishlist.deleteMany({
    where: {
      userId,
      tmdbId,
    },
  });
}
