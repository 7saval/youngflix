"use client";

import Image from "next/image";

import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import type { CatalogMovie } from "@/types/movie";
import { useEffect, useMemo, useRef, useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";

type MovieDetailModalProps = {
  movie: CatalogMovie;
  onClose: () => void;
};

const PROGRESS_UPDATE_INTERVAL_MS = 500;
const PLAYED_PROGRESS_COLOR = "#e50914";
const REMAINING_PROGRESS_COLOR = "rgba(255, 255, 255, 0.28)";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function MovieDetailModal({ movie, onClose }: MovieDetailModalProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const backgroundImage = movie.backdropUrl ?? movie.posterUrl;
  const releaseYear = movie.releaseDate?.getFullYear();
  const rating =
    typeof movie.voteAverage === "number" ? movie.voteAverage.toFixed(1) : null;
  const { user, session } = useAuth();
  const {
    isWishlisted,
    loading: wishlistLoading,
    ready,
    toggleWishlist,
  } = useWishlist({
    accessToken: session?.access_token,
    enabled: Boolean(user),
    tmdbId: movie.tmdbId,
  });

  const genreLabel =
    movie.genreNames.length > 0
      ? movie.genreNames.slice(0, 3).join(" · ")
      : null;

  const [isPlaying, setIsPlaying] = useState(Boolean(movie.trailerKey));
  const [isMuted, setIsMuted] = useState(Boolean(movie.trailerKey));
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const trailerOptions = useMemo(
    () => ({
      width: "100%",
      height: "100%",
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        mute: 1,
        playsinline: 1,
        rel: 0,
      },
    }),
    [],
  );

  const clearProgressTimer = () => {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const syncPlaybackProgress = async () => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    const [nextCurrentTime, nextDuration] = await Promise.all([
      player.getCurrentTime(),
      player.getDuration(),
    ]);

    setCurrentTime(nextCurrentTime);
    setDuration(nextDuration);
  };

  const startProgressTimer = () => {
    clearProgressTimer();
    progressTimerRef.current = window.setInterval(() => {
      void syncPlaybackProgress();
    }, PROGRESS_UPDATE_INTERVAL_MS);
  };

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
      clearProgressTimer();
    };
  }, [onClose]);

  const handleTrailerReady = async (event: YouTubeEvent) => {
    playerRef.current = event.target;
    setIsMuted(await event.target.isMuted());
    setDuration(await event.target.getDuration());
    startProgressTimer();
  };

  const handleTrailerPlay = () => {
    setIsPlaying(true);
    startProgressTimer();
  };

  const handleTrailerPause = () => {
    setIsPlaying(false);
    void syncPlaybackProgress();
    clearProgressTimer();
  };

  const handleTrailerEnd = () => {
    setIsPlaying(false);
    setCurrentTime(duration);
    clearProgressTimer();
  };

  const togglePlayback = async () => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (isPlaying) {
      await player.pauseVideo();
      setIsPlaying(false);
      return;
    }

    await player.playVideo();
    setIsPlaying(true);
  };

  const toggleMuted = async () => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (isMuted) {
      await player.unMute();
      setIsMuted(false);
      return;
    }

    await player.mute();
    setIsMuted(true);
  };

  const handleSeek = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const player = playerRef.current;
    const nextTime = Number(event.target.value);

    setCurrentTime(nextTime);

    if (!player) {
      return;
    }

    await player.seekTo(nextTime, true);
  };

  const progressMax = duration > 0 ? duration : 0;
  const progressPercent =
    progressMax > 0 ? Math.min((currentTime / progressMax) * 100, 100) : 0;
  const progressTrackBackground = `linear-gradient(to right, ${PLAYED_PROGRESS_COLOR} ${progressPercent}%, ${REMAINING_PROGRESS_COLOR} ${progressPercent}%)`;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm"
      role="dialog"
    >
      <button
        aria-label="상세 모달 닫기"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
        <div className="group relative h-[360px] md:h-[460px]">
          {movie.trailerKey ? (
            <>
              <YouTube
                className="h-full w-full"
                iframeClassName="h-full w-full"
                onEnd={handleTrailerEnd}
                onPause={handleTrailerPause}
                onPlay={handleTrailerPlay}
                onReady={handleTrailerReady}
                opts={trailerOptions}
                title={`${movie.title} 예고편`}
                videoId={movie.trailerKey}
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-4 pt-16 opacity-0 transition duration-300 group-hover:opacity-100 md:px-6">
                <div className="pointer-events-auto space-y-3">
                  <input
                    aria-label="예고편 재생 위치"
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
                    max={progressMax}
                    min={0}
                    onChange={(event) => {
                      void handleSeek(event);
                    }}
                    step={0.1}
                    style={{
                      background: progressTrackBackground,
                    }}
                    type="range"
                    value={Math.min(currentTime, progressMax)}
                  />

                  <div className="flex items-center justify-between gap-3">
                    <button
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
                      onClick={() => {
                        void togglePlayback();
                      }}
                      type="button"
                    >
                      {isPlaying ? "일시정지" : "재생"}
                    </button>

                    <div className="text-sm font-medium text-white/90">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-20 right-5 z-30 opacity-0 transition duration-300 group-hover:opacity-100">
                <button
                  aria-label={isMuted ? "소리 켜기" : "소리 끄기"}
                  className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/65"
                  onClick={() => {
                    void toggleMuted();
                  }}
                  type="button"
                >
                  <span className="text-lg leading-none">
                    {isMuted ? "🔇" : "🔊"}
                  </span>
                </button>
              </div>
            </>
          ) : backgroundImage ? (
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

          {!movie.trailerKey ? (
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-black/20" />
          ) : null}

          <button
            aria-label="상세 모달 닫기"
            className="absolute right-5 top-5 z-30 rounded-full bg-black/60 px-3 py-2 text-sm font-medium text-white transition hover:bg-black/80"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>

        <div className="grid gap-8 px-6 py-6 md:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.8fr)] md:px-8 md:py-8">
          <div className="space-y-5">
            <div className="space-y-4">
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
                {genreLabel ? <span>{genreLabel}</span> : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
                disabled={!movie.trailerKey}
                onClick={() => {
                  void togglePlayback();
                }}
                type="button"
              >
                {movie.trailerKey
                  ? isPlaying
                    ? "예고편 일시정지"
                    : "예고편 재생"
                  : "예고편 없음"}
              </button>
              <button
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!user || wishlistLoading}
                onClick={() => {
                  void toggleWishlist();
                }}
                type="button"
              >
                {!user
                  ? "로그인 후 찜 가능"
                  : wishlistLoading
                    ? "처리 중..."
                    : !ready
                      ? "불러오는 중..."
                      : isWishlisted
                        ? "찜 해제"
                        : "찜하기"}
              </button>
              {movie.trailerKey ? (
                <span className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white">
                  {isMuted ? "현재 음소거" : "현재 소리 켜짐"}
                </span>
              ) : null}
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
                Wishlist
              </p>
              <p className="text-sm text-neutral-200">
                {!user
                  ? "로그인하면 찜 목록에 저장할 수 있습니다."
                  : isWishlisted
                    ? "현재 찜 목록에 저장된 콘텐츠입니다."
                    : "원하면 찜 목록에 저장해 나중에 다시 볼 수 있습니다."}
                {movie.trailerKey
                  ? "영상 영역에서 예고편을 선명하게 재생하고, hover 시 컨트롤을 사용할 수 있습니다."
                  : "예고편 데이터가 없어 대표 이미지를 표시합니다."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
