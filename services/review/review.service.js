const Review = require('../../schemas/review/review.schema');
const emptyChecker = require('../../utils/emptyChecker');

const createReview = async ({
  userId,
  content,
  starpoint,
  imgUrls,
  movieId,
}) => {
  try {
    const result = (
      await Review.create({ userId, content, starpoint, imgUrls, movieId })
    ).toObject();

    if (!result) {
      throw new Error('리뷰 등록 실패');
    }
    return result;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const createReport = async ({ commentId, userId, reason }) => {
  try {
    await Review.updateOne(
      { _id: commentId },
      {
        $push: {
          reportlist: {
            user: userId,
            reason,
          },
        },
      }
    );

    return { message: '신고 접수 성공' };
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const findMovieIdCommentsArray = async ({ movieId, skip, limit }) => {
  try {
    const result = await Review.find({ movieId })
      .populate('userId', 'profile nickname')
      .lean();

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
          deletedAt: null,
        },
      },
      {
        $group: {
          _id: null,
          totalStarScore: { $avg: '$starpoint' },
        },
      },
    ]);

    if (emptyChecker({ result })) {
      return { _id: null, totalStarScore: 0 };
    }
    return result[0];
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const updateLikeCommentIdLikes = async ({ userId, commentId, likes }) => {
  // _id는 Object이므로 String으로 변환
  try {
    const result = await findCommentIdComment({ commentId });

    if (likes.like) {
      if (!result[0].like.includes(userId)) {
        await Review.updateOne(
          { _id: commentId },
          {
            $push: { like: userId },
            $pull: {
              dislike: userId,
            },
          }
        );
        return { message: '좋아요를 눌렀어요.' };
      } else {
        return { message: '이미 좋아요를 눌렀어요.' };
      }
    }

    if (likes.dislike) {
      if (!result[0].dislike.includes(userId)) {
        await Review.updateOne(
          { _id: commentId },
          {
            $push: { dislike: userId },
            $pull: {
              like: userId,
            },
          }
        );
        return { message: '싫어요를 눌렀어요.' };
      } else {
        return { message: '이미 싫어요를 눌렀어요.' };
      }
    }

    if (likes.like === false && likes.dislike === false) {
      // 형변환 ...
      if (
        result[0].like.some(
          (item) => JSON.stringify(item) === JSON.stringify(userId)
        )
      ) {
        await Review.updateOne(
          { _id: commentId },
          {
            $pull: {
              like: userId,
            },
          }
        );
        return { message: '좋아요 취소' };
      }

      // 형변환 ...
      if (
        result[0].dislike.some(
          (item) => JSON.stringify(item) === JSON.stringify(userId)
        )
      ) {
        await Review.updateOne(
          { _id: commentId },
          {
            $pull: {
              dislike: userId,
            },
          }
        );
        return { message: '싫어요 취소' };
      }
    }
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const findCommentIdComment = async ({ commentId }) => {
  try {
    const result = await Review.find({ _id: commentId }).lean();

    if (!result) {
      throw new Error('리뷰 조회 실패');
    }
    return result;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const findUserReviews = async ({ userId, skip, limit }) => {
  try {
    const result = await Review.find({ userId }).skip(skip).limit(limit).lean();

    return result;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const updateCommentIdComment = async ({
  commentId,
  content,
  starpoint,
  imgUrls,
}) => {
  try {
    const result = await Review.updateOne(
      { _id: commentId },
      {
        content,
        starpoint,
        imgUrls,
      }
    ).lean();

    return result;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const deleteCommentIdComment = async ({ commentId }) => {
  try {
    const result = await Review.updateOne(
      { _id: commentId },
      { deletedAt: new Date().toISOString() }
    ).lean();

    return result;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

module.exports = {
  createReview,
  createReport,
  findCommentIdComment,
  updateLikeCommentIdLikes,
  updateCommentIdComment,
  deleteCommentIdComment,
  findMovieIdCommentsArray,
  findMovieIdStarScoreSum,
  findUserReviews,
};
