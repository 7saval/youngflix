"use server";

import { revalidatePath } from "next/cache";

import { getCachedDiscoverMovies } from "@/app/actions/tmdb";

export async function syncTmdbMoviesAction() {
  await getCachedDiscoverMovies();

  revalidatePath("/");
}
