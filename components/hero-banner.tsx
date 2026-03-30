import Image from "next/image";
import type { CatalogMovie } from "@/types/movie";

type HeroBannerProps = {
  movie: CatalogMovie;
};

export function HeroBanner({ movie }: HeroBannerProps) {
  const backgroundImage = movie.backdropUrl ?? movie.posterUrl;
  const releaseYear = movie.releaseDate?.getFullYear();
  const genres = movie.genreNames.slice(0, 3).join(" • ");

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950">
      {backgroundImage ? (
        <Image
          alt={movie.title}
          className="absolute inset-0 h-full w-full object-cover"
          fill
          priority
          src={backgroundImage}
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

      <div className="relative flex min-h-[460px] items-end px-6 py-10 md:px-10 md:py-12">
        <div className="max-w-2xl space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-red-500">
              Youngflix Featured
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
              {movie.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-200">
            <span className="rounded bg-red-600 px-3 py-1 font-semibold text-white">
              추천 콘텐츠
            </span>
            {releaseYear ? <span>{releaseYear}</span> : null}
            {typeof movie.voteAverage === "number" ? (
              <span>평점 {movie.voteAverage.toFixed(1)}</span>
            ) : null}
            {genres ? <span>{genres}</span> : null}
          </div>

          <p className="max-w-xl text-sm leading-7 text-neutral-200 md:text-base">
            {movie.overview || "대표 콘텐츠 설명이 아직 준비되지 않았습니다."}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded bg-white px-6 py-3 font-semibold text-black transition hover:bg-neutral-200"
              type="button"
            >
              재생 준비 중
            </button>
            <button
              className="rounded bg-white/15 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/25"
              type="button"
            >
              상세 정보 준비 중
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
