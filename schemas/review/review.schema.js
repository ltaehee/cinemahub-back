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
    reportlist: [
      {
        user: { type: ObjectId, ref: 'User' },
        reason: { type: String },
      },
    ],
    reportstatus: {
      type: Boolean,
      default: false,
    },
    like: [{ type: ObjectId, ref: 'User' }],
    dislike: [{ type: ObjectId, ref: 'User' }],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: true,
    },
  }
);
// 리뷰 신고 상태값

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
