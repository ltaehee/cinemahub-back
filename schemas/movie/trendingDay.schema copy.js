const mongoose = require("mongoose");

const trendingDaySchema = new mongoose.Schema({
  day: {
    type: [Number],
    required: true,
  },
});

const TrendingDay = mongoose.model("TrendingDay", trendingDaySchema);
module.exports = TrendingDay;
