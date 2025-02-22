const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: 'User',
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
      type: Boolean,
      default: false,
    },
    dislike: {
      type: Boolean,
      default: false,
    },
    totalLike: {
      type: Number,
      default: 1,
    },
    totalUnlike: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: {
      createdAt: true,
    },
  }
);

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
