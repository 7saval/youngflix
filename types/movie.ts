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
