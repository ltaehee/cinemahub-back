const Movie = require("../../schemas/movie/movie.schema");
require("dotenv").config();
const axios = require("axios");
const cron = require("node-cron");

const fetchMovies = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const startYear = 2010;
    const currentYear = new Date().getFullYear();
    let totalMovies = 0;

    for (let year = startYear; year <= currentYear; year++) {
      const initialResponse = await axios.get(
        `${process.env.TMDB_API_BASE_URL}/discover/movie`,
        {
          params: {
            "primary_release_date.gte": `${year}-01-01`,
            "primary_release_date.lte": today,
            language: "ko-KR",
            sort_by: "popularity.desc",
            page: 1,
          },
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        }
      );

      const totalPages = initialResponse.data.total_pages;

      for (let page = 1; page <= totalPages; page++) {
        const response = await axios.get(
          `${process.env.TMDB_API_BASE_URL}/discover/movie`,
          {
            params: {
              "primary_release_date.gte": `${year}-01-01`,
              "primary_release_date.lte": today,
              language: "ko-KR",
              sort_by: "popularity.desc",
              page: page,
            },
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            },
          }
        );

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
          `년도 ${year} 페이지 ${page} 처리 완료, 현재까지 ${totalMovies}개 저장됨`
        );
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
