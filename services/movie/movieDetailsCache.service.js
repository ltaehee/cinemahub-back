const axios = require("axios");
const MovieDetailsCache = require("../../schemas/movie/movieDetailsCache.schema");

const CACHE_TIME = 60 * 60 * 24 * 7;

const fetchMovieDetails = async (movieId) => {
  try {
    const cachedMovie = await MovieDetailsCache.findOne({ movieId });

    if (cachedMovie) {
      const timeDiff = (Date.now() - cachedMovie.updatedAt) / 1000;

      if (timeDiff < CACHE_TIME) {
        console.log(`MongoDB 캐시된 데이터 반환: 영화 ID ${movieId}`);
        return cachedMovie;
      }

      console.log(`MongoDB 캐시 만료, 새 데이터 요청: 영화 ID ${movieId}`);
    }

    const detailsResponse = await axios.get(
      `${process.env.TMDB_API_BASE_URL}/movie/${movieId}`,
      {
        params: {
          language: "ko-KR",
          append_to_response: "images,videos,credits",
          include_image_language: "ko,null",
        },
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      }
    );

    const { data } = detailsResponse;
    const imgPath =
      data.images?.backdrops?.map((image) => image.file_path) || [];
    const { runtime, genres } = data;

    const trailers = data.videos.results.filter(
      (video) => video.type === "Trailer"
    );
    trailers.sort(
      (a, b) => new Date(a.published_at) - new Date(b.published_at)
    );

    const trailer =
      trailers.length > 0
        ? `https://www.youtube.com/watch?v=${trailers[0].key}`
        : null;

    const actor = data.credits.cast
      .filter((person) => person.known_for_department === "Acting")
      .slice(0, 5)
      .map((actor) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profilePath: actor.profile_path,
      }));

    const director = data.credits.crew
      .filter((person) => person.job === "Director")
      .map((director) => ({
        id: director.id,
        name: director.name,
        profilePath: director.profile_path,
      }));

    const movieDetails = {
      movieId,
      imgPath,
      runtime,
      genres,
      trailer,
      actor,
      director,
      updatedAt: new Date(),
    };

    await MovieDetailsCache.findOneAndUpdate({ movieId }, movieDetails, {
      upsert: true,
      new: true,
    });

    console.log(`MongoDB에 데이터 저장 완료: 영화 ID ${movieId}`);

    return movieDetails;
  } catch (error) {
    console.error(
      `영화 ID ${movieId}의 상세 정보를 가져오는 중 오류 발생:`,
      error.message
    );
    return {};
  }
};

module.exports = { fetchMovieDetails };
