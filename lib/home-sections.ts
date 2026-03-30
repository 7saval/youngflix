import type { CatalogMovie } from "@/types/movie";

// 홈 화면의 각 가로 섹션(Row)이 가져야 하는 기본 형태입니다.
// 예: "지금 인기 있는 콘텐츠" / [영화 배열]
export type HomeSection = {
  title: string;
  movies: CatalogMovie[];
};

// 메인 홈 화면에서 필요한 최종 데이터 구조입니다.
// 대표 배너에 들어갈 영화 1개와, 아래에 렌더링할 여러 섹션 목록으로 구성합니다.
export type HomePageData = {
  featuredMovie: CatalogMovie | null;
  sections: HomeSection[];
};

// 한 줄(Row)에 너무 많은 카드가 나오지 않도록 최대 개수를 제한합니다.
const MAX_MOVIES_PER_ROW = 12;

// 장르 Row도 너무 많아지면 화면이 복잡해지므로 상위 몇 개만 보여줍니다.
const MAX_GENRE_ROWS = 6;

function getFeaturedMovie(movies: CatalogMovie[]) {
  // 대표 배너에는 가로형 배경 이미지가 있으면 가장 보기 좋기 때문에
  // backdrop 또는 poster가 있는 영화를 우선 찾습니다.
  // 조건에 맞는 영화가 없으면 첫 번째 영화라도 보여주고,
  // 영화가 아예 없으면 null을 반환합니다.
  return (
    movies.find((movie) => movie.backdropUrl || movie.posterUrl) ?? movies[0] ?? null
  );
}

function getPopularMovies(movies: CatalogMovie[]) {
  // 현재는 DB에서 가져온 순서를 그대로 "인기 콘텐츠"로 사용합니다.
  // page.tsx에서 updatedAt 기준으로 정렬해서 가져오기 때문에
  // 여기서는 앞쪽 영화 몇 개만 잘라서 보여줍니다.
  return movies.slice(0, MAX_MOVIES_PER_ROW);
}

function getTopRatedMovies(movies: CatalogMovie[]) {
  // 평점이 없는 영화는 제외하고,
  // 평점이 높은 순서대로 정렬한 뒤 상위 몇 개만 가져옵니다.
  // [...movies]로 복사하는 이유는 원본 배열을 직접 바꾸지 않기 위해서입니다.
  return [...movies]
    .filter((movie) => typeof movie.voteAverage === "number")
    .sort((left, right) => (right.voteAverage ?? 0) - (left.voteAverage ?? 0))
    .slice(0, MAX_MOVIES_PER_ROW);
}

function getGenreSections(movies: CatalogMovie[]) {
  // 장르 이름을 key로, 그 장르에 속한 영화 배열을 value로 저장할 Map입니다.
  // 예: "Action" => [영화1, 영화2, 영화3]
  const genreMap = new Map<string, CatalogMovie[]>();

  // 모든 영화를 돌면서 각 영화가 가진 장르별로 Map에 차곡차곡 모읍니다.
  for (const movie of movies) {
    for (const genre of movie.genreNames) {
      // 이미 저장된 장르면 기존 배열을 가져오고,
      // 아직 없으면 빈 배열부터 시작합니다.
      const genreMovies = genreMap.get(genre) ?? [];
      genreMovies.push(movie);
      genreMap.set(genre, genreMovies);
    }
  }

  // Map을 배열로 바꾼 뒤
  // 1) 영화가 2개 이상 있는 장르만 남기고
  // 2) 영화가 많은 장르 순서대로 정렬하고
  // 3) 너무 많은 Row가 생기지 않도록 상위 장르만 자르고
  // 4) 최종적으로 HomeSection 형태로 변환합니다.
  return [...genreMap.entries()]
    .filter(([, genreMovies]) => genreMovies.length >= 2)
    .sort((left, right) => right[1].length - left[1].length)
    .slice(0, MAX_GENRE_ROWS)
    .map(([genre, genreMovies]) => ({
      // 장르 이름이 섹션 제목이 됩니다.
      title: genre,
      // 각 장르 안에서도 카드가 너무 많지 않게 최대 개수를 제한합니다.
      movies: genreMovies.slice(0, MAX_MOVIES_PER_ROW),
    }));
}

export function buildHomePageData(movies: CatalogMovie[]): HomePageData {
  // 대표 배너에 들어갈 영화 1개를 먼저 고릅니다.
  const featuredMovie = getFeaturedMovie(movies);

  // 최종적으로 화면에 보여줄 섹션들을 순서대로 담을 배열입니다.
  const sections: HomeSection[] = [];

  // 홈 화면에서 사용할 주요 섹션 데이터를 각각 준비합니다.
  const popularMovies = getPopularMovies(movies);
  const topRatedMovies = getTopRatedMovies(movies);
  const genreSections = getGenreSections(movies);

  // 데이터가 있을 때만 섹션을 추가해서, 빈 Row가 생기지 않게 합니다.
  if (popularMovies.length > 0) {
    sections.push({
      title: "지금 인기 있는 콘텐츠",
      movies: popularMovies,
    });
  }

  if (topRatedMovies.length > 0) {
    sections.push({
      title: "높은 평점 영화",
      movies: topRatedMovies,
    });
  }

  // 장르별 섹션은 여러 개이므로 펼쳐서 한 번에 추가합니다.
  sections.push(...genreSections);

  // 페이지에서 바로 사용할 수 있도록 대표 영화 + 섹션 목록 형태로 반환합니다.
  return {
    featuredMovie,
    sections,
  };
}
