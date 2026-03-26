import Image from "next/image";
import type { Movie } from "@prisma/client";

type MovieCardProps = {
  movie: Movie;
};

export function MovieCard({ movie }: MovieCardProps) {
  const imageUrl = movie.posterUrl ?? movie.backdropUrl;

  return (
    <article className="group relative w-[180px] flex-none overflow-hidden rounded-md bg-neutral-900 transition duration-300 hover:-translate-y-1 hover:scale-[1.03]">
      <div className="relative aspect-[2/3] bg-neutral-800">
        {imageUrl ? (
          <Image
            alt={movie.title}
            className="h-full w-full object-cover"
            fill
            src={imageUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-neutral-400">
            이미지 없음
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-70 transition duration-300 group-hover:opacity-100" />

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="text-sm font-semibold text-white">{movie.title}</h3>
          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-200">
            <span className="rounded bg-white/15 px-2 py-1">
              ★ {movie.voteAverage?.toFixed(1) ?? "N/A"}
            </span>
            <span className="rounded border border-white/20 px-2 py-1">
              {movie.trailerKey ? "예고편 있음" : "정보만 보기"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
