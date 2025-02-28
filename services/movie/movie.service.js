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
            include_adult: false,
            page: 1,
          },
        });

        const totalPages = initialResponse.data.total_pages;
        const pagesToFetch = Math.min(totalPages, 500);

        for (let page = 1; page <= pagesToFetch; page += 5) {
          const pageBatch = Array.from(
            { length: Math.min(5, pagesToFetch - page + 1) },
            (_, i) => page + i
          );

          try {
            const responses = await Promise.allSettled(
              pageBatch.map((p) =>
                tmdbApi.get(`/discover/movie`, {
                  params: {
                    "primary_release_date.gte": yearStart,
                    "primary_release_date.lte": yearEnd,
                    language: "ko-KR",
                    sort_by: "popularity.desc",
                    include_adult: false,
                    page: p,
                  },
                })
              )
            );

            for (const result of responses) {
              if (result.status !== "fulfilled") {
                console.error(
                  `${year}년 ${result.reason.config.params.page}페이지 요청 실패:`,
                  result.reason.message
                );
                continue;
              }

              const movies = result.value.data.results;

              for (let i = 0; i < movies.length; i += 10) {
                const batch = movies.slice(i, i + 10);

                const saveResults = await Promise.allSettled(
                  batch.map((movie) =>
                    Movie.findOneAndUpdate(
                      { movieId: movie.id.toString() },
                      {
                        title: movie.title,
                        overview: movie.overview,
                        releaseDate: movie.release_date,
                        posterPath: movie.poster_path,
                        backdropPath: movie.backdrop_path,
                        genreIds: movie.genre_ids,
                      },
                      { upsert: true, new: true }
                    )
                  )
                );

                saveResults.forEach((res, index) => {
                  if (res.status === "fulfilled") {
                    totalMovies++;
                  } else {
                    console.error(
                      `${year}년 ${page}~${page + 4}페이지 ${
                        i + index + 1
                      }번째 영화 저장 실패:`,
                      res.reason
                    );
                  }
                });
              }
            }
          } catch (error) {
            console.error(
              `${year}년도 ${page}~${page + 4}페이지 요청 중 오류 발생:`,
              error.message
            );
          }
        }
      } catch (error) {
        console.error(`${year}년도 데이터 수집 중 오류 발생:`, error.message);
      }
    }

    console.log(`총 ${totalMovies}개의 영화 데이터 저장 완료`);
  } catch (error) {
    console.error("TMDB API 요청 실패:", error.message);
  }
};

cron.schedule("0 0 * * *", () => {
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

// 장르 별 영화 가져오기
const findMoviesByGenre = async (genreId, page, limit) => {
  try {
    limit = Number(limit);
    page = Number(page);

    const skip = page * limit;

    const movies = await Movie.find({
      genreIds: { $in: [genreId] },
    })
      .skip(skip)
      .limit(limit)
      .select("genreIds movieId posterPath releaseDate title -_id");
    return movies;
  } catch (err) {
    console.error("DB에서 영화 조회 중 오류 발생: ", err);
    throw new Error("영화 조회 실패");
  }
};

module.exports = {
  findMovieByKeyword,
  findMoviesByTmdbIds,
  findMoviesByGenre,
};
