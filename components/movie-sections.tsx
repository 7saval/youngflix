"use client";

import { useState } from "react";

import { MovieDetailModal } from "@/components/movie-detail-modal";
import { MovieRow } from "@/components/movie-row";
import type { HomeSection } from "@/lib/home-sections";
import type { CatalogMovie } from "@/types/movie";

type MovieSectionsProps = {
  sections: HomeSection[];
};

export function MovieSections({ sections }: MovieSectionsProps) {
  const [selectedMovie, setSelectedMovie] = useState<CatalogMovie | null>(null);

  return (
    <>
      <section className="space-y-10">
        {sections.map((section) => (
          <MovieRow
            key={section.title}
            movies={section.movies}
            onSelectMovie={setSelectedMovie}
            title={section.title}
          />
        ))}
      </section>

      {selectedMovie ? (
        <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      ) : null}
    </>
  );
}
