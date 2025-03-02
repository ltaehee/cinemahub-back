const cron = require("node-cron");
const popularPersonCacheSchema = require("../../schemas/person/popularPersonCache.schema");
const { tmdbApi } = require("../tmdbApi");

const fetchPopularActors = async () => {
  try {
    const response = await tmdbApi.get(`/person/popular`, {
      params: { language: "ko-KR", page: 1 },
    });

    const actors = response.data.results;

    for (const actor of actors) {
      try {
        await popularPersonCacheSchema.findOneAndUpdate(
          { personId: actor.id.toString() },
          {
            name: actor.name,
            profilePath: actor.profile_path,
            knownFor: actor.known_for.map((movie) => ({
              movieId: movie.id.toString(),
              title: movie.title,
              posterPath: movie.poster_path,
            })),
            popularity: actor.popularity,
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error(`배우 ${actor.name} 업데이트 실패:`, error.message);
      }
    }
  } catch (error) {
    console.error("TMDB 배우 데이터 요청 실패:", error.message);
  }
};

cron.schedule("0 0 * * *", fetchPopularActors);

const getPopularActors = async () => {
  try {
    const actors = await popularPersonCacheSchema
      .find()
      .sort({ popularity: -1 });

    return actors;
  } catch (error) {
    console.error("인기 배우 데이터 조회 실패:", error.message);
    return [];
  }
};

module.exports = { getPopularActors };
