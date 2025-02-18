const { LRUCache } = require("lru-cache");
const axios = require("axios");
const { TMDB_SEARCH_API_KEY } = require("../../consts/app");

const cache = new LRUCache({
  max: 100, // 최대 100개 캐시 저장
  ttl: 1000 * 60 * 20, // 20분 후 자동 삭제
});

const findActorByName = async (name) => {
  const cacheKey = `actor-${name}`;

  // 캐시에서 데이터 조회
  if (cache.has(cacheKey)) {
    console.log(`캐시에서 결과 반환: ${name}`);
    return cache.get(cacheKey);
  }

  console.log(`캐시 없음, TMDB API 호출: ${name}`);
  try {
    const searchResponse = await axios.get(
      `https://api.themoviedb.org/3/search/person?api_key=${TMDB_SEARCH_API_KEY}&query=${encodeURIComponent(
        name
      )}&language=ko-KR`
    );

    if (searchResponse.data.results.length === 0) {
      throw new Error("배우를 찾을 수 없습니다.");
    }

    const filteredActors = searchResponse.data.results.filter(
      (person) => person.known_for_department === "Acting"
    );

    // api 결과를 캐시에 저장
    cache.set(cacheKey, filteredActors);
    console.log(`캐시에 저장: ${name} `);

    return filteredActors;
  } catch (err) {
    console.error("배우 검색 오류:", err);
    throw new Error("배우 정보를 가져오는 중 오류가 발생했습니다.");
  }
};

module.exports = { findActorByName };
