const PersonDetailsCredits = require("../../schemas/person/personDetailsCredits.schema");
const { tmdbApi } = require("../tmdbApi");
const Movie = require("../../schemas/movie/movie.schema");

const CACHE_TIME = 60 * 60 * 24 * 7;

const fetchPersonDetailsCredits = async (personId, page, limit) => {
  try {
    limit = Number(limit);
    page = Number(page);

    const skip = page * limit;
    const cachedPerson = await PersonDetailsCredits.findOne({ personId });

    if (cachedPerson) {
      const timeDiff =
        (Date.now() - new Date(cachedPerson.updatedAt).getTime()) / 1000;

      if (timeDiff < CACHE_TIME) {
        console.log(`MongoDB 캐시된 데이터 반환: 영화인 ID ${personId}`);
        return {
          totalCount: cachedPerson.credits.length,
          credits: cachedPerson.credits.slice(skip, skip + limit),
        };
      }
    }

    const response = await tmdbApi.get(`/person/${personId}/movie_credits`, {
      params: {
        language: "ko-KR",
        include_image_language: "ko,null",
      },
    });

    const { data } = response;
    const { cast, crew } = data;

    const movieIds = await Movie.find({}, { movieId: 1 }).then((movies) =>
      movies.map((movie) => movie.movieId)
    );

    const creditsMap = new Map();

    [...cast, ...crew]
      .filter((movie) => movieIds.includes(movie.id))
      .forEach((movie) => {
        if (!creditsMap.has(movie.id)) {
          creditsMap.set(movie.id, {
            movieId: movie.id,
            title: movie.title,
            releaseDate: movie.release_date,
            posterPath: movie.poster_path,
            genreIds: movie.genre_ids,
          });
        }
      });

    const credits = Array.from(creditsMap.values());

    await PersonDetailsCredits.findOneAndUpdate(
      { personId },
      { credits, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return {
      totalCount: credits.length,
      credits: credits.slice(skip, skip + limit),
    };
  } catch (error) {
    console.error(
      `영화인 ID ${personId}의 영화 데이터를 가져오는 중 오류 발생:`,
      error.message
    );
    return null;
  }
};

module.exports = { fetchPersonDetailsCredits };
