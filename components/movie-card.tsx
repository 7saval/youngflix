"use client";

import Image from "next/image";
import type { Movie } from "@prisma/client";
import { useRef } from "react";

import { MovieCardOverlay } from "@/components/movie-card-overlay";

type MovieCardProps = {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onPreviewStart?: (element: HTMLElement) => void;
};

export function MovieCard({ movie, onSelect, onPreviewStart }: MovieCardProps) {
  const articleRef = useRef<HTMLElement | null>(null);
  const imageUrl = movie.posterUrl ?? movie.backdropUrl;
  const releaseYear = movie.releaseDate?.getFullYear();
  const rating =
    typeof movie.voteAverage === "number" ? movie.voteAverage.toFixed(1) : null;
  const genres = movie.genreNames.slice(0, 2).join(" • ");

  const handlePreviewStart = () => {
    if (articleRef.current) {
      onPreviewStart?.(articleRef.current);
    }
  };

  return (
    <article
      className="group relative h-[430px] w-[180px] flex-none transition-[width] duration-300 ease-out hover:w-[320px] focus-within:w-[320px] md:h-[460px] md:w-[200px]"
      ref={articleRef}
    >
      <button
        aria-label={`${movie.title} 상세 보기`}
        className="absolute bottom-0 left-0 z-10 h-[270px] w-full overflow-hidden rounded-xl bg-neutral-900 text-left shadow-[0_12px_40px_rgba(0,0,0,0.28)] transition-[height,box-shadow] duration-300 ease-out hover:z-40 hover:h-[430px] hover:shadow-[0_30px_80px_rgba(0,0,0,0.58)] focus-visible:z-40 focus-visible:h-[430px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/80 focus-visible:shadow-[0_30px_80px_rgba(0,0,0,0.58)] md:h-[300px] md:focus-visible:h-[460px] md:hover:h-[460px]"
        onClick={() => onSelect(movie)}
        onFocus={handlePreviewStart}
        onMouseEnter={handlePreviewStart}
        type="button"
      >
        <div className="absolute inset-0 bg-neutral-800">
          {imageUrl ? (
            <Image
              alt={movie.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.08] group-focus-within:scale-[1.08]"
              fill
              sizes="(max-width: 768px) 180px, 320px"
              src={imageUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-neutral-400">
              이미지 없음
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5 transition duration-300 group-hover:opacity-50 group-focus-within:opacity-50" />

        <div className="absolute inset-x-0 bottom-0 p-4 transition duration-300 group-hover:opacity-0 group-focus-within:opacity-0">
          <div className="space-y-2">
            <h3 className="text-base font-semibold leading-tight text-white">
              {movie.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-100">
              {rating ? (
                <span className="rounded-full bg-white/18 px-2.5 py-1 font-medium">
                  평점 {rating}
                </span>
              ) : null}
              {releaseYear ? <span>{releaseYear}</span> : null}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          <MovieCardOverlay
            genres={genres}
            hasTrailer={Boolean(movie.trailerKey)}
            overview={movie.overview}
            rating={rating}
            releaseYear={releaseYear}
            title={movie.title}
          />
        </div>
      </button>
    </article>
  );
}
