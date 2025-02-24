const Movie = require("../../schemas/movie/movie.schema");
const { fetchMovieDetails } = require("./movieDetailsCache.service");
const { tmdbApi } = require("../tmdbApi");
const { LRUCache } = require("lru-cache");

const dailyCache = new LRUCache({
  max: 1,
  ttl: 1000 * 60 * 60 * 24,
});

const weeklyCache = new LRUCache({
  max: 1,
  ttl: 1000 * 60 * 60 * 24 * 7,
});

const fetchTrendingMovies = async (type) => {
  try {
    const response = await tmdbApi.get(`/trending/movie/${type}`, {
      params: { language: "ko-KR" },
    });

    const movieIds = response.data.results
      .slice(0, type === "day" ? 10 : 20)
      .map((movie) => movie.id);

    const movies = await Movie.find({ movieId: { $in: movieIds } });

    const moviesWithDetails = [];

    for (let movie of movies) {
      const movieDetails = await fetchMovieDetails(movie.movieId);
      moviesWithDetails.push({
        ...movie.toObject(),
        trailer: movieDetails.trailer,
        logoPath: movieDetails.logoPath,
        koreanRating: movieDetails.koreanRating,
        imgPath: movieDetails.imgPath,
        runtime: movieDetails.runtime,
        actor: movieDetails.actor,
        director: movieDetails.director,
      });
    }

    if (type === "day") {
      dailyCache.set("trending_day", moviesWithDetails);
    } else {
      weeklyCache.set("trending_week", movies);
    }
  } catch (error) {
    console.error(`fetchTrendingMovies(${type}) 에러:`, error.message);
  }
};

const fetchTrendingBoth = async () => {
  await Promise.all([fetchTrendingMovies("day"), fetchTrendingMovies("week")]);
};

const getTrendingMovies = (type) => {
  if (type === "day") return dailyCache.get("trending_day") ?? [];
  return weeklyCache.get("trending_week") ?? [];
};

const getTrendingBoth = () => ({
  day: getTrendingMovies("day"),
  week: getTrendingMovies("week"),
});
module.exports = { fetchTrendingBoth, getTrendingBoth };
