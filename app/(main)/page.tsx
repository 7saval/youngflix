import { syncTmdbMoviesAction } from "@/app/actions/sync-movies";
import { prisma } from "@/lib/prisma";
import type { Movie } from "@prisma/client";

export default async function HomePage() {
  const movies: Movie[] = await prisma.movie.findMany({
    orderBy: { updatedAt: "desc" },
    take: 12,
  });

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white md:px-12">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-red-500">
            Youngflix Admin
          </p>
          <h1 className="text-4xl font-bold text-red-600 md:text-6xl">
            YOUNGFLIX
          </h1>
          <p className="max-w-2xl text-sm text-gray-300 md:text-base">
            TMDB 영화를 불러와 MongoDB에 저장하고, 저장된 데이터를 메인 화면에서
            바로 확인할 수 있는 기본 흐름입니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <form action={syncTmdbMoviesAction}>
            <button
              className="rounded bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              type="submit"
            >
              TMDB 데이터 동기화
            </button>
          </form>
          <span className="text-sm text-gray-400">
            저장된 영화 {movies.length}개 표시 중
          </span>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {movies.length === 0 ? (
            <div className="rounded border border-dashed border-gray-700 bg-gray-950 p-8 text-sm text-gray-400">
              아직 저장된 영화가 없습니다. `db push` 완료 후 TMDB 동기화를
              실행해 주세요.
            </div>
          ) : (
            movies.map((movie) => (
              <article
                className="rounded-xl border border-gray-800 bg-gray-950 p-5"
                key={movie.id}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold">{movie.title}</h2>
                    <span className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-300">
                      TMDB #{movie.tmdbId}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-sm text-gray-400">
                    {movie.overview || "줄거리 정보가 없습니다."}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {movie.genreNames.map((genre) => (
                    <span
                      className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-200"
                      key={`${movie.id}-${genre}`}
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="mt-4 space-y-1 text-sm text-gray-400">
                  <p>평점: {movie.voteAverage?.toFixed(1) ?? "N/A"}</p>
                  <p>
                    트레일러 키: {movie.trailerKey ? movie.trailerKey : "없음"}
                  </p>
                </div>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}
