const Movie = require("../../schemas/movie/movie.schema");
const cron = require("node-cron");
const { tmdbApi } = require("../tmdbApi");

const fetchMovies = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const startYear = 2010;
    const currentYear = new Date().getFullYear();
    let totalMovies = 0;

    for (let year = startYear; year <= currentYear; year++) {
      try {
        const yearStart = `${year}-01-01`;
        const yearEnd = year === currentYear ? today : `${year}-12-31`;

        const initialResponse = await tmdbApi.get(`/discover/movie`, {
          params: {
            "primary_release_date.gte": yearStart,
            "primary_release_date.lte": yearEnd,
            language: "ko-KR",
            sort_by: "popularity.desc",
            page: 1,
          },
        });

        const totalPages = initialResponse.data.total_pages;
        const pagesToFetch = Math.min(totalPages, 500);

        for (let page = 1; page <= pagesToFetch; page++) {
          try {
            const response = await tmdbApi.get(`/discover/movie`, {
              params: {
                "primary_release_date.gte": yearStart,
                "primary_release_date.lte": yearEnd,
                language: "ko-KR",
                sort_by: "popularity.desc",
                page: page,
              },
            });

            const movies = response.data.results;

            for (const movie of movies) {
              if (
                !/[가-힣]/.test(movie.title) &&
                !/[가-힣]/.test(movie.original_title)
              ) {
                continue;
              }

              await Movie.findOneAndUpdate(
                { movieId: movie.id },
                {
                  title: movie.title,
                  overview: movie.overview,
                  releaseDate: movie.release_date,
                  posterPath: movie.poster_path,
                  backdropPath: movie.backdrop_path,
                  genreIds: movie.genre_ids,
                },
                { upsert: true, new: true }
              );
              totalMovies++;
            }

            console.log(
              `${year}년도 ${page}페이지 처리 완료, 현재까지 ${totalMovies}개 저장됨`
            );
          } catch (error) {
            console.error(
              `${year}년도 ${page}페이지 처리 중 오류 발생:`,
              error.message
            );
          }
        }
      } catch (error) {
        console.error(`${year}년도 데이터 수집 중 오류 발생:`, error.message);
      }
    }
  } catch (error) {
    console.error("TMDB API 요청 실패:", error.message);
  }
};
cron.schedule("0 0 * * *", () => {
  console.log("영화 데이터 업데이트 시작");
  fetchMovies();
});

// 검색해서 영화 정보 가져오기
const findMovieByKeyword = async (keyword) => {
  try {
    const movies = await Movie.find({
      title: { $regex: `^${keyword}`, $options: "i" },
    }).limit(10); // 검색 10개로 제한
    return movies;
  } catch (err) {
    console.error("영화 검색 오류: ", err);
    throw new Error(err.message);
  }
};

module.exports = {
  findMovieByKeyword,
};
