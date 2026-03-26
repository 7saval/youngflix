"use client";

import type { Movie } from "@prisma/client";
import { useRef } from "react";

import { MovieCard } from "@/components/movie-card";

type MovieRowProps = {
  title: string;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
};

const PREVIEW_WIDTH = 320;
const PREVIEW_GUTTER = 24;
const SCROLL_DURATION_MS = 520;

export function MovieRow({ title, movies, onSelectMovie }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  if (movies.length === 0) {
    return null;
  }

  const animateScrollTo = (container: HTMLDivElement, targetLeft: number) => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const startLeft = container.scrollLeft;
    const distance = targetLeft - startLeft;

    if (Math.abs(distance) < 2) {
      container.scrollLeft = targetLeft;
      return;
    }

    const startTime = performance.now();

    const easeInOutCubic = (progress: number) =>
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / SCROLL_DURATION_MS, 1);
      const eased = easeInOutCubic(progress);

      container.scrollLeft = startLeft + distance * eased;

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
  };

  const revealCard = (element: HTMLElement) => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const contentWidth = container.scrollWidth;
    const maxScrollLeft = Math.max(0, contentWidth - container.clientWidth);
    const previewLeft = Math.max(0, element.offsetLeft - PREVIEW_GUTTER);
    const previewRight = element.offsetLeft + PREVIEW_WIDTH + PREVIEW_GUTTER;
    const previewWidth = previewRight - previewLeft;
    const targetLeft =
      previewLeft - Math.max(0, (container.clientWidth - previewWidth) / 2);
    const clampedLeft = Math.min(Math.max(0, targetLeft), maxScrollLeft);

    animateScrollTo(container, clampedLeft);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-white md:text-2xl">
          {title}
        </h2>
        <span className="text-sm text-neutral-400">
          {movies.length}개 콘텐츠
        </span>
      </div>

      <div
        className="-mx-6 overflow-x-auto overflow-y-visible px-6 py-4 md:-mx-10 md:px-10 md:py-6"
        ref={scrollRef}
      >
        <div className="flex min-w-max items-end gap-4 md:gap-5">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onPreviewStart={revealCard}
              onSelect={onSelectMovie}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
