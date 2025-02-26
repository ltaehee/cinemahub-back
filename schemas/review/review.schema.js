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
    imgUrls: {
      type: Array,
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
    like: [{ type: ObjectId, ref: 'User' }],
    dislike: [{ type: ObjectId, ref: 'User' }],
  },
  {
    timestamps: {
      createdAt: true,
    },
  }
);

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
