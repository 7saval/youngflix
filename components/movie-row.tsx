import type { Movie } from "@prisma/client";

import { MovieCard } from "@/components/movie-card";

type MovieRowProps = {
  title: string;
  movies: Movie[];
};

export function MovieRow({ title, movies }: MovieRowProps) {
  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-white md:text-2xl">{title}</h2>
        <span className="text-sm text-neutral-400">{movies.length}개 콘텐츠</span>
      </div>

      <div className="-mx-6 overflow-x-auto px-6 md:-mx-10 md:px-10">
        <div className="flex min-w-max gap-4 pb-2">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
}
