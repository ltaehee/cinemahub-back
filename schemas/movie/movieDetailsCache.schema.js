const mongoose = require("mongoose");

const movieDetailsCacheSchema = new mongoose.Schema({
  movieId: { type: Number, required: true, unique: true },
  title: String,
  overview: String,
  releaseDate: String,
  backdropPath: String,
  posterPath: String,
  genreIds: [Number],
  trailer: String,
  logoPath: String,
  koreanRating: String,
  runtime: Number,
  tagline: String,
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
  updatedAt: { type: Date, default: Date.now, index: { expires: "7d" } },
});

const movieDetailsCache = mongoose.model(
  "MovieDetailsCache",
  movieDetailsCacheSchema
);
module.exports = movieDetailsCache;
