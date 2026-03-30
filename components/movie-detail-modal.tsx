"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import type { CatalogMovie } from "@/types/movie";

type MovieDetailModalProps = {
  movie: CatalogMovie;
  onClose: () => void;
};

export function MovieDetailModal({ movie, onClose }: MovieDetailModalProps) {
  const backgroundImage = movie.backdropUrl ?? movie.posterUrl;
  const releaseYear = movie.releaseDate?.getFullYear();
  const rating =
    typeof movie.voteAverage === "number" ? movie.voteAverage.toFixed(1) : null;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-10 backdrop-blur-sm"
      role="dialog"
    >
      <button
        aria-label="상세 모달 닫기"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
        <div className="relative h-[280px] md:h-[380px]">
          {backgroundImage ? (
            <Image
              alt={movie.title}
              className="h-full w-full object-cover"
              fill
              priority
              sizes="100vw"
              src={backgroundImage}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-neutral-900 text-neutral-400">
              이미지 없음
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-black/10" />

          <button
            aria-label="닫기"
            className="absolute right-5 top-5 rounded-full bg-black/60 px-3 py-2 text-sm font-medium text-white transition hover:bg-black/80"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>

          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                {movie.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-100">
                {rating ? (
                  <span className="rounded-full bg-red-600 px-3 py-1 font-semibold text-white">
                    평점 {rating}
                  </span>
                ) : null}
                {releaseYear ? <span>{releaseYear}</span> : null}
                {movie.genreNames.length > 0 ? (
                  <span>{movie.genreNames.slice(0, 3).join(" • ")}</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 px-6 py-6 md:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.8fr)] md:px-8 md:py-8">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
                type="button"
              >
                {movie.trailerKey ? "예고편 준비" : "상세 정보"}
              </button>
              <button
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                type="button"
              >
                내가 찜할까?
              </button>
            </div>

            <p className="text-sm leading-7 text-neutral-200 md:text-base">
              {movie.overview || "이 콘텐츠에 대한 설명은 곧 추가됩니다."}
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
                Overview
              </p>
              <p className="text-sm text-neutral-200">
                Youngflix에서 추천 중인 콘텐츠입니다.
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
                Genres
              </p>
              <p className="text-sm text-neutral-200">
                {movie.genreNames.length > 0
                  ? movie.genreNames.join(", ")
                  : "장르 정보 없음"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
                Release
              </p>
              <p className="text-sm text-neutral-200">
                {releaseYear ? `${releaseYear}년` : "공개일 정보 없음"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
                Trailer
              </p>
              <p className="text-sm text-neutral-200">
                {movie.trailerKey
                  ? "예고편 데이터를 보유하고 있습니다."
                  : "예고편 데이터가 아직 없습니다."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
