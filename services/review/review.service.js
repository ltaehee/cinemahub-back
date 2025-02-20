const Review = require('../../schemas/review/review.schema');

const createReview = async () => {
  try {
    const result = await Review.create({});
  } catch (e) {}
};

module.exports = { createReview };
