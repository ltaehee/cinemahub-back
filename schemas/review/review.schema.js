const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    movieId: {
      // api 영화 고유 id
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    starpoint: {
      type: Number,
      required: true,
    },
    like: {
      type: Number,
    },
    dislike: {
      type: Number,
    },
  },
  {
    timestamps: {
      createdAt: true,
    },
  }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
