require("dotenv").config();
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
      await popularPersonCacheSchema.findOneAndUpdate(
        { personId: actor.id },
        {
          name: actor.name,
          profilePath: actor.profile_path,
          knownFor: actor.known_for.map((movie) => ({
            movieId: movie.id,
            title: movie.title,
            posterPath: movie.poster_path,
          })),
          popularity: actor.popularity,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    console.log("인기 배우 데이터 업데이트 완료");
  } catch (error) {
    console.error("TMDB 배우 데이터 요청 실패:", error.message);
  }
};

cron.schedule("0 0 * * *", fetchPopularActors);
