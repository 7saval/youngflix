import { syncTmdbMoviesAction } from "@/app/actions/sync-movies";
import { HeroBanner } from "@/components/hero-banner";
import { MovieSections } from "@/components/movie-sections";
import { getHomeCatalogMovies } from "@/lib/catalog";
import { buildHomePageData } from "@/lib/home-sections";

export default async function HomePage() {
  const movies = await getHomeCatalogMovies();
  const { featuredMovie, sections } = buildHomePageData(movies);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex w-full max-w-[1600px] flex-col gap-10 px-6 py-6 md:px-10 md:py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-red-500">
              Youngflix
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              지금 뜨는 홈
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-400">
              저장된 영화 {movies.length}개
            </span>
            <form action={syncTmdbMoviesAction}>
              <button
                className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                type="submit"
              >
                동기화
              </button>
            </form>
          </div>
        </header>

        {featuredMovie ? (
          <HeroBanner movie={featuredMovie} />
        ) : (
          <section className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-950 px-8 py-20 text-center text-neutral-400">
            아직 저장된 영화가 없습니다. TMDB 동기화를 실행하면 홈 화면이 채워집니다.
          </section>
        )}

        <MovieSections sections={sections} />
      </section>
    </main>
  );
}
