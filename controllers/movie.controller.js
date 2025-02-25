const {
  fetchMovieDetails,
} = require("../services/movie/movieDetailsCache.service");
const {
  fetchMovieDetailsImages,
} = require("../services/movie/movieDetailsImages.service");
const {
  fetchMovieDetailsPosters,
} = require("../services/movie/movieDetailsPosters.service");
const {
  getTrendingBoth,
  fetchTrendingBoth,
} = require("../services/movie/trending.service");

const movieController = require("express").Router();

movieController.get("/trending", async (req, res) => {
  let { day, week } = getTrendingBoth();

  if (day.length === 0 || week.length === 0) {
    await fetchTrendingBoth();
    ({ day, week } = getTrendingBoth());
  }

  res.json({ trending_day: day, trending_week: week });
});

movieController.get("/:movieId", async (req, res) => {
  const { movieId } = req.params;

  try {
    const movieDetails = await fetchMovieDetails(movieId);
    res.json(movieDetails);
  } catch (error) {
    console.error(`영화 정보 요청 에러: ${error.message}`);
    res.status(500).json({ message: "영화 정보 요청 에러" });
  }
});

movieController.get("/:movieId/images", async (req, res) => {
  const { movieId } = req.params;
  const { page, limit } = req.query;

  try {
    const movieImages = await fetchMovieDetailsImages(movieId, page, limit);
    res.json(movieImages);
  } catch (error) {
    console.error(`영화 이미지 요청 에러: ${error.message}`);
    res.status(500).json({ message: "영화 이미지 요청 에러" });
  }
});

movieController.get("/:movieId/posters", async (req, res) => {
  const { movieId } = req.params;
  const { page, limit } = req.query;

  try {
    const moviePosters = await fetchMovieDetailsPosters(movieId, page, limit);
    res.json(moviePosters);
  } catch (error) {
    console.error(`영화 포스터 요청 에러: ${error.message}`);
    res.status(500).json({ message: "영화 포스터 요청 에러" });
  }
});

module.exports = movieController;
