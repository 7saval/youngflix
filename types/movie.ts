export type CatalogMovie = {
  tmdbId: number;
  title: string;
  overview: string | null;
  trailerKey: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: Date | null;
  voteAverage: number | null;
  genreIds: number[];
  genreNames: string[];
};

type CatalogMovieInput = Omit<CatalogMovie, "releaseDate"> & {
  releaseDate: Date | string | null;
};

function toDate(value: Date | string | null) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function normalizeCatalogMovie(movie: CatalogMovieInput): CatalogMovie {
  return {
    ...movie,
    releaseDate: toDate(movie.releaseDate),
  };
}

export function normalizeCatalogMovies(
  movies: CatalogMovieInput[],
): CatalogMovie[] {
  return movies.map(normalizeCatalogMovie);
}
