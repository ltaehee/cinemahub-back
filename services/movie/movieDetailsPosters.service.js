const MovieDetailsPosters = require("../../schemas/movie/movieDetailsPosters.schema");
const { tmdbApi } = require("../tmdbApi");

const CACHE_TIME = 60 * 60 * 24 * 7;

const fetchMovieDetailsPosters = async (movieId, page, limit) => {
  try {
    limit = Number(limit);

    const skip = page * limit;
    const cachedMovie = await MovieDetailsPosters.findOne({ movieId });

    if (cachedMovie) {
      const timeDiff =
        (Date.now() - new Date(cachedMovie.updatedAt).getTime()) / 1000;

      if (timeDiff < CACHE_TIME) {
        console.log(`MongoDB 캐시된 데이터 반환: 영화 ID ${movieId}`);
        return {
          posters: cachedMovie.posterPath.slice(skip, skip + limit),
          totalCount: cachedMovie.posterPath.length,
        };
      }
    }

    const response = await tmdbApi.get(`/movie/${movieId}/images`);
    const posterPath =
      response.data.posters?.map((poster) => poster.file_path) ?? [];

    await MovieDetailsPosters.findOneAndUpdate(
      { movieId },
      { posterPath, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return {
      posters: posterPath.slice(skip, skip + limit),
      totalCount: posterPath.length,
    };
  } catch (error) {
    console.error(
      `영화 ID ${movieId}의 포스터 데이터를 가져오는 중 오류 발생:`,
      error.message
    );
    return null;
  }
};

module.exports = { fetchMovieDetailsPosters };
