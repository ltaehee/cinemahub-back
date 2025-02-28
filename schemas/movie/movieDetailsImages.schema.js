const mongoose = require("mongoose");

const movieDetailsImagesSchema = new mongoose.Schema({
  movieId: { type: String, required: true, unique: true },
  imgPath: [String],
  updatedAt: { type: Date, default: Date.now, index: { expires: "7d" } },
});

const MovieDetailsImages = mongoose.model(
  "MovieDetailsImages",
  movieDetailsImagesSchema
);
module.exports = MovieDetailsImages;
