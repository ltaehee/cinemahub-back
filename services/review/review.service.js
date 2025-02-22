const Review = require('../../schemas/review/review.schema');

const createReview = async ({ userId, content, starpoint, image, movieId }) => {
  try {
    const result = (
      await Review.create({ userId, content, starpoint, image, movieId })
    ).toObject();

    if (!result) {
      throw new Error('리뷰 등록 실패');
    }
    return result;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const findMovieIdCommentsArray = async ({ movieId, skip, limit }) => {
  try {
    const result = await Review.find({ movieId })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'profile nickname')
      .lean();

    if (!result) {
      throw new Error('영화 리뷰 조회 실패');
    }
    return result;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const findMovieIdStarScoreSum = async ({ movieId }) => {
  try {
    const result = await Review.aggregate([
      {
        $match: {
          movieId,
        },
      },
      {
        $group: {
          _id: null,
          totalStarScore: { $avg: '$starpoint' },
        },
      },
    ]);

    if (!result) {
      throw new Error('별점 조회 실패');
    }

    return result[0].totalStarScore;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

module.exports = {
  createReview,
  findMovieIdCommentsArray,
  findMovieIdStarScoreSum,
};
