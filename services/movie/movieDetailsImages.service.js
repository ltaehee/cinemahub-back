const MovieDetailsImages = require("../../schemas/movie/movieDetailsImages.schema");
const { tmdbApi } = require("../tmdbApi");

const CACHE_TIME = 60 * 60 * 24 * 7;

const fetchMovieDetailsImages = async (movieId, page, limit) => {
  try {
    limit = Number(limit);
    page = Number(page);

    const skip = page * limit;
    const cachedMovie = await MovieDetailsImages.findOne({ movieId });

    if (cachedMovie) {
      const timeDiff =
        (Date.now() - new Date(cachedMovie.updatedAt).getTime()) / 1000;

      if (timeDiff < CACHE_TIME) {
        return {
          images: cachedMovie.imgPath.slice(skip, skip + limit),
          totalCount: cachedMovie.imgPath.length,
        };
      }
    }

    const response = await tmdbApi.get(`/movie/${movieId}/images`);
    const imgPath =
      response.data.backdrops?.map((image) => image.file_path) ?? [];

    await MovieDetailsImages.findOneAndUpdate(
      { movieId },
      { imgPath, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return {
      images: imgPath.slice(skip, skip + limit),
      totalCount: imgPath.length,
    };
  } catch (error) {
    console.error(
      `영화 ID ${movieId}의 이미지 데이터를 가져오는 중 오류 발생:`,
      error.message
    );
    return null;
  }
};

module.exports = { fetchMovieDetailsImages };
