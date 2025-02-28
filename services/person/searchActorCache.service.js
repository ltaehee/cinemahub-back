const { LRUCache } = require("lru-cache");
const { tmdbApi } = require("../tmdbApi");
const { findMoviesByTmdbIds } = require("../movie/movie.service");

const cache = new LRUCache({
  max: 100, // 최대 100개 캐시 저장
  ttl: 1000 * 60 * 20, // 20분 후 자동 삭제
});

// 모든 요청에서 중복 체크를 위한 저장소 추가
const loadedMovieIds = new Set();

const findPeopleByName = async (name, page = 1) => {
  const cacheKey = `people-${name}-page-${page}`;

  // 캐시에서 데이터 조회
  if (cache.has(cacheKey)) {
    console.log(`캐시에서 결과 반환: ${name}, 페이지: ${page}`);
    return cache.get(cacheKey);
  }

  console.log(`캐시 없음, TMDB API 호출: ${name}, 페이지: ${page}`);
  try {
    const searchResponse = await tmdbApi.get(`/search/person`, {
      params: {
        query: name,
        language: "ko-KR",
        page: page,
      },
    });

    if (searchResponse.data.results.length === 0) {
      throw new Error("배우나 감독을 찾을 수 없습니다.");
    }

    const totalPages = searchResponse.data.total_pages; // 총 페이지 수

    const filteredPeoples = searchResponse.data.results.filter(
      (person) =>
        (person.known_for_department === "Acting" &&
          person.known_for.some((work) => work.media_type === "movie")) || // 영화 배우 필터
        (person.known_for_department === "Directing" &&
          person.known_for.some((work) => work.media_type === "movie")) // 영화 감독 필터
    );

    // 배우별 known_for에서 중복 영화 제거
    filteredPeoples.forEach((people) => {
      people.known_for = Array.from(
        new Map(
          people.known_for.map((movie) => [String(movie.id), movie])
        ).values()
      );
    });
    console.log("filteredPeoples: ", filteredPeoples);

    // 모든 배우의 `known_for` 영화 목록을 하나의 배열로 합치기
    const allMovies = filteredPeoples.flatMap((person) => person.known_for);
    // console.log("allMovies: ", allMovies);

    // 중복 제거 (영화 ID 기준)
    let uniqueMovies = Array.from(
      new Map(allMovies.map((movie) => [String(movie.id), movie])).values()
    );

    // 이전 페이지에서 가져온 영화와 중복 제거
    uniqueMovies = uniqueMovies.filter(
      (movie) => !loadedMovieIds.has(String(movie.id))
    );

    // 중복 제거 후, 가져온 영화 ID들을 저장 (다음 페이지 중복 방지)
    uniqueMovies.forEach((movie) => loadedMovieIds.add(String(movie.id)));

    // DB저장된 영화 ID 조회
    const matchedMovies = await findMoviesByTmdbIds(
      uniqueMovies.map((movie) => String(movie.id))
    );

    // 최종적으로 DB에 있는 영화만 필터링
    const filteredMovies = uniqueMovies.filter((movie) =>
      matchedMovies.some((dbMovie) => dbMovie.movieId === String(movie.id))
    );

    // 최종적으로 또 중복 제거
    const finalMovies = Array.from(
      new Map(filteredMovies.map((movie) => [String(movie.id), movie])).values()
    );

    // 배우 정보에서 DB에 있는 영화만 포함
    const finalPeoples = filteredPeoples.map((people) => ({
      ...people,
      known_for: finalMovies.filter((movie) =>
        people.known_for.some((knownMovie) => knownMovie.id === movie.id)
      ),
    }));

    // api 결과를 캐시에 저장
    const result = { people: finalPeoples, movies: finalMovies, totalPages };

    cache.set(cacheKey, result);
    console.log(`캐시에 저장: ${name} `);

    // 모든 페이지가 끝나면 loadedMovieIds 초기화
    if (page === totalPages) {
      loadedMovieIds.clear();
    }

    return result;
  } catch (err) {
    console.error("배우, 감독 검색 오류:", err);
    throw new Error("배우, 감독 정보를 가져오는 중 오류가 발생했습니다.");
  }
};

module.exports = { findPeopleByName };
