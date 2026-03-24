"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getDiscoverMoviesWithDetails } from "@/lib/tmdb";

export async function syncTmdbMoviesAction() {
  const movies = await getDiscoverMoviesWithDetails();

  await Promise.all(
    movies.map((movie) =>
      prisma.movie.upsert({
        where: { tmdbId: movie.tmdbId },
        update: {
          title: movie.title,
          overview: movie.overview,
          trailerKey: movie.trailerKey,
          posterUrl: movie.posterUrl,
          backdropUrl: movie.backdropUrl,
          releaseDate: movie.releaseDate,
          voteAverage: movie.voteAverage,
          genreIds: movie.genreIds,
          genreNames: movie.genreNames,
        },
        create: movie,
      }),
    ),
  );

  revalidatePath("/");
}
