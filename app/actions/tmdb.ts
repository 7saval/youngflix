"use server";

import { Redis } from "@upstash/redis";
import { getDiscoverMoviesWithDetails } from "@/lib/tmdb";

// 환경변수에 UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN이 포함되어야 합니다.
const redis = Redis.fromEnv();

// Redis에 보관할 시간 (초기화 단위: 초 - 여기서는 12시간)
const CACHE_TTL = 60 * 60 * 12;

/**
 * TMDB API를 통해 영화 데이터를 조회할 때, Redis キャ시를 우선 확인합니다.
 * キャ시가 없으면 TMDB API를 직접 호출하고, 그 결과를 Redis에 저장한 후 반환합니다.
 */
type TMDBMovies = Awaited<ReturnType<typeof getDiscoverMoviesWithDetails>>;

export async function getCachedDiscoverMovies(page = 1): Promise<TMDBMovies> {
  const cacheKey = `tmdb:discover:movies:page:${page}`;
  
  try {
    // 1. Redis에서 데이터 조회 시도 (타입 지정)
    const cachedData = await redis.get<TMDBMovies>(cacheKey);
    
    // @upstash/redis의 get()은 기본적으로 JSON을 객체로 파싱하여 반환합니다.
    if (cachedData && Array.isArray(cachedData)) {
      console.log(`[Cache HIT] TMDB 영화 목록 (page: ${page})`);
      return cachedData;
    }
    
    // 2. 캐시 조회 실패 시 TMDB API 데이터 직접 조회
    console.log(`[Cache MISS] 원본 TMDB API 호출 (page: ${page})`);
    const data = await getDiscoverMoviesWithDetails(page);
    
    // 3. 조회한 데이터를 Redis에 저장 (TTL 설정)
    await redis.set(cacheKey, data, { ex: CACHE_TTL });
    
    return data;
  } catch (error) {
    // Redis 오류 등으로 인한 실패 시, 원본 TMDB API를 1회 직접 호출하도록 Fallback(대체 작동) 처리합니다.
    console.error("Redis 요청 중 오류 발생. 원본 API로 대체 요청 진행.", error);
    const fallbackData = await getDiscoverMoviesWithDetails(page);
    return fallbackData;
  }
}
