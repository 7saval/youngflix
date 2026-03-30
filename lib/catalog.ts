import { getCachedDiscoverMovies } from "@/app/actions/tmdb";
import type { CatalogMovie } from "@/types/movie";

export async function getHomeCatalogMovies(): Promise<CatalogMovie[]> {
  return getCachedDiscoverMovies();
}
