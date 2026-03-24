const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

type TMDBMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
};

type TMDBDiscoverResponse = {
  results: TMDBMovie[];
};

type TMDBGenre = {
  id: number;
  name: string;
};

type TMDBGenreResponse = {
  genres: TMDBGenre[];
};

type TMDBVideo = {
  key: string;
  site: string;
  type: string;
  official: boolean;
};

type TMDBVideoResponse = {
  results: TMDBVideo[];
};

function getTMDBApiKey() {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not set.");
  }

  return apiKey;
}

async function fetchTMDB<T>(
  path: string,
  searchParams: Record<string, string> = {},
): Promise<T> {
  const apiKey = getTMDBApiKey();
  const params = new URLSearchParams({
    api_key: apiKey,
    language: "ko-KR",
    ...searchParams,
  });

  const response = await fetch(`${TMDB_BASE_URL}${path}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function buildImageUrl(path: string | null, size: "w500" | "w780") {
  if (!path) {
    return null;
  }

  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export async function getGenreMap() {
  const data = await fetchTMDB<TMDBGenreResponse>("/genre/movie/list");

  return new Map(data.genres.map((genre) => [genre.id, genre.name]));
}

export async function getDiscoverMovies(page = 1) {
  const data = await fetchTMDB<TMDBDiscoverResponse>("/discover/movie", {
    include_adult: "false",
    sort_by: "popularity.desc",
    page: String(page),
  });

  return data.results;
}

export async function getMovieTrailerKey(movieId: number) {
  const data = await fetchTMDB<TMDBVideoResponse>(`/movie/${movieId}/videos`);

  const bestVideo =
    data.results.find(
      (video) =>
        video.site === "YouTube" &&
        video.type === "Trailer" &&
        video.official,
    ) ??
    data.results.find(
      (video) => video.site === "YouTube" && video.type === "Trailer",
    ) ??
    data.results.find(
      (video) => video.site === "YouTube" && video.type === "Teaser",
    );

  return bestVideo?.key ?? null;
}

export async function getDiscoverMoviesWithDetails(page = 1) {
  const [genreMap, movies] = await Promise.all([
    getGenreMap(),
    getDiscoverMovies(page),
  ]);

  return Promise.all(
    movies.map(async (movie) => {
      const genreNames = movie.genre_ids
        .map((genreId) => genreMap.get(genreId))
        .filter((genreName): genreName is string => Boolean(genreName));

      const trailerKey = await getMovieTrailerKey(movie.id);

      return {
        tmdbId: movie.id,
        title: movie.title,
        overview: movie.overview || null,
        trailerKey,
        posterUrl: buildImageUrl(movie.poster_path, "w500"),
        backdropUrl: buildImageUrl(movie.backdrop_path, "w780"),
        releaseDate: movie.release_date ? new Date(movie.release_date) : null,
        voteAverage: movie.vote_average ?? null,
        genreIds: movie.genre_ids,
        genreNames,
      };
    }),
  );
}
