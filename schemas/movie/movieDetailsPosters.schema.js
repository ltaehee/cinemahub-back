const mongoose = require("mongoose");

const movieDetailsPosters = new mongoose.Schema({
  movieId: { type: Number, required: true, unique: true },
  posterPath: [String],
  updatedAt: { type: Date, default: Date.now, index: { expires: "7d" } },
});

const MovieDetailsPosters = mongoose.model(
  "MovieDetailsPosters",
  movieDetailsPosters
);
module.exports = MovieDetailsPosters;
