"use client";

type MovieCardOverlayProps = {
  title: string;
  rating: string | null;
  releaseYear?: number;
  genres: string;
  overview: string | null;
  hasTrailer: boolean;
};

export function MovieCardOverlay({
  title,
  rating,
  releaseYear,
  genres,
  overview,
  hasTrailer,
}: MovieCardOverlayProps) {
  return (
    <div className="absolute inset-0 flex h-full w-full flex-col justify-end rounded-xl border border-white/10 bg-black/45 p-5 text-white backdrop-blur-[2px]">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold leading-tight">{title}</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-100">
            {rating ? (
              <span className="rounded-full bg-red-600 px-2.5 py-1 font-semibold text-white">
                평점 {rating}
              </span>
            ) : null}
            {releaseYear ? <span>{releaseYear}</span> : null}
            {genres ? <span>{genres}</span> : null}
          </div>
        </div>

        <p className="line-clamp-5 text-sm leading-6 text-neutral-100">
          {overview || "상세 설명은 곧 추가됩니다."}
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">
            상세 보기
          </span>
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white">
            {hasTrailer ? "예고편 있음" : "정보만 보기"}
          </span>
        </div>
      </div>
    </div>
  );
}
