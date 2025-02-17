const mongoose = require("mongoose");

const movieDetailsCacheSchema = new mongoose.Schema({
  movieId: { type: Number, required: true, unique: true },
  imgPath: [String],
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
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MovieDetailsCache", movieDetailsCacheSchema);
