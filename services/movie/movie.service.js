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
const findMovieByKeyword = async (keyword, page = 1, limit = 16) => {
  try {
    const movies = await Movie.find({
      title: { $regex: `^${keyword}`, $options: "i" }, // keyword로 시작하는 모든 영화 검색
    })
      .skip((page - 1) * limit) // 이전 페이지 데이터 건너뛰기
      .limit(limit);

    const totalCount = await Movie.countDocuments({
      title: { $regex: `^${keyword}`, $options: "i" },
    });

    console.log("totalCount: ", totalCount);

    return { movies, totalCount };
  } catch (err) {
    console.error("영화 검색 오류: ", err);
    throw new Error(err.message);
  }
};

// 영화ID로 DB에 저장된 영화 찾기
const findMoviesByTmdbIds = async (tmdbMovieIds) => {
  try {
    const movies = await Movie.find({ movieId: { $in: tmdbMovieIds } });

    if (movies.length === 0) {
      console.log("일치하는 영화가 없습니다.");
      return [];
    }
    return movies;
  } catch (err) {
    console.error("DB에서 영화 조회 중 오류 발생: ", err);
    throw new Error("영화 조회 실패");
  }
};
module.exports = {
  findMovieByKeyword,
  findMoviesByTmdbIds,
};
