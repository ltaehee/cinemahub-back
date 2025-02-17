const mongoose = require("mongoose");

const trendingWeekSchema = new mongoose.Schema({
  week: {
    type: [Number],
    required: true,
  },
});

const TrendingWeek = mongoose.model("TrendingWeek", trendingWeekSchema);
module.exports = TrendingWeek;
