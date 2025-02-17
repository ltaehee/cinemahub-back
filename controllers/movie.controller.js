const movieController = require("express").Router();

movieController.get("/trending", async (req, res) => {
  const { day, week } = getTrendingBoth();

  if (day.length === 0 || week.length === 0) {
    await fetchTrendingBoth();
    ({ day, week } = getTrendingBoth());
  }

  res.json({ trending_day: day, trending_week: week });
});

module.exports = movieController;
