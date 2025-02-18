const mongoose = require("mongoose");

const movieDetailsCacheSchema = new mongoose.Schema({
  movieId: { type: Number, required: true, unique: true },
  imgPath: [String],
  logoPath: String,
  runtime: Number,
  genres: [{ id: Number, name: String }],
  trailer: String,
  actor: [
    {
      id: Number,
      name: String,
      character: String,
      profilePath: String,
    },
  ],
  director: [
    {
      id: Number,
      name: String,
      profilePath: String,
    },
  ],
  koreanRating: String,
  updatedAt: { type: Date, default: Date.now, index: { expires: "7d" } },
});

module.exports = mongoose.model("MovieDetailsCache", movieDetailsCacheSchema);
