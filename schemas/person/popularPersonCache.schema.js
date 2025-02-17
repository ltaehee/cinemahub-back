const mongoose = require("mongoose");

const popularPersonCacheSchema = new mongoose.Schema({
  personId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  profilePath: { type: String },
  knownFor: [{ movieId: Number, title: String, posterPath: String }],
  popularity: { type: Number },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "PopularPersonCacheSchema",
  popularPersonCacheSchema
);
