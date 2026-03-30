import { getCachedDiscoverMovies } from "@/app/actions/tmdb";
import {
  normalizeCatalogMovies,
  type CatalogMovie,
} from "@/types/movie";

export async function getHomeCatalogMovies(): Promise<CatalogMovie[]> {
  const movies = await getCachedDiscoverMovies();

  return normalizeCatalogMovies(movies);
}
