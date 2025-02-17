const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  movieId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  overview: { type: String },
  releaseDate: { type: String },
  posterPath: { type: String },
  backdropPath: { type: String },
  genreIds: [Number],
});

const Movie = mongoose.model("Movie", movieSchema);
module.exports = Movie;
