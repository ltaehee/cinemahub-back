const MovieDetailsCache = require("../../schemas/movie/movieDetailsCache.schema");
const { tmdbApi } = require("../tmdbApi");

const CACHE_TIME = 60 * 60 * 24 * 7;

const fetchMovieDetails = async (movieId) => {
  try {
    const cachedMovie = await MovieDetailsCache.findOne({ movieId });

    if (cachedMovie) {
      const timeDiff = (Date.now() - cachedMovie.updatedAt) / 1000;

      if (timeDiff < CACHE_TIME) {
        return cachedMovie;
      }
    }

    const detailsResponse = await tmdbApi.get(`/movie/${movieId}`, {
      params: {
        language: "ko-KR",
        append_to_response: "videos,credits,release_dates,images",
        include_image_language: "ko,null",
      },
    });

    const { data } = detailsResponse;

    const {
      videos,
      credits,
      images,
      runtime,
      genres,
      title,
      release_date,
      backdrop_path,
      poster_path,
      overview,
      tagline,
    } = data;

    const genreIds = genres.map((genre) => genre.id);

    const logoPath =
      images?.logos?.filter((logo) => logo.iso_639_1 === "ko")[1]?.file_path ??
      images?.logos?.filter((logo) => logo.iso_639_1 === "ko")[0]?.file_path ??
      null;

    const koreaRelease = data.release_dates?.results?.find(
      (r) => r.iso_3166_1 === "KR"
    );
    const koreanRating =
      koreaRelease?.release_dates?.[0]?.certification ?? "등급 정보 없음";

    const trailers = videos.results.filter((video) => video.type === "Trailer");
    trailers.sort(
      (a, b) => new Date(a.published_at) - new Date(b.published_at)
    );

    const trailer = trailers.length > 0 ? trailers[0].key : null;

    const actor = credits.cast
      .filter((person) => person.known_for_department === "Acting")
      .slice(0, 5)
      .map((actor) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profilePath: actor.profile_path,
      }));

    const director = credits.crew
      .filter((person) => person.job === "Director")
      .map((director) => ({
        id: director.id,
        name: director.name,
        profilePath: director.profile_path,
      }));

    const movieDetails = {
      movieId,
      title,
      overview,
      releaseDate: release_date,
      backdropPath: backdrop_path,
      posterPath: poster_path,
      genreIds,
      trailer,
      logoPath,
      koreanRating,
      runtime,
      actor,
      director,
      tagline,
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
