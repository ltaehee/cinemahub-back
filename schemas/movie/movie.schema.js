const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  movieId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  overview: String,
  releaseDate: String,
  posterPath: String,
  backdropPath: String,
  genreIds: [Number],
});

const Movie = mongoose.model("Movie", movieSchema);
module.exports = Movie;
