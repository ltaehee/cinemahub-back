const mongoose = require("mongoose");

const popularPersonCacheSchema = new mongoose.Schema({
  personId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  profilePath: { type: String },
  knownFor: [{ movieId: Number, title: String, posterPath: String }],
  popularity: { type: Number },
  updatedAt: { type: Date, default: Date.now, index: { expires: "1d" } },
});

module.exports = mongoose.model(
  "PopularPersonCacheSchema",
  popularPersonCacheSchema
);
