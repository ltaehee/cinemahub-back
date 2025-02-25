const checklogin = require('../../middlewares/checklogin');
const { findUserEmailId } = require('../../services/user/user.service');
const {
  createReview,
  updateLikeCommentIdLikes,
  findMovieIdCommentsArray,
  findMovieIdStarScoreSum,
  findCommentIdComment,
} = require('../../services/review/review.service');
const emptyChecker = require('../../utils/emptyChecker');

const reviewController = require('express').Router();

reviewController.post('/register', checklogin, async (req, res) => {
  const { movieId, image, content, starpoint } = req.body;
  const { email } = req.session.user;

  if (emptyChecker({ movieId, image, content, starpoint })) {
    return res
      .status(400)
      .json({ result: false, message: '리뷰 내용 작성과 별점을 등록해주세요' });
  }

  if (!email) {
    return res.status(401).json({
      result: false,
      message: '로그인 유지 시간이 만료되었습니다. 다시 로그인 해주세요.',
    });
  }

  try {
    const _id = await findUserEmailId({ email });

    if (!_id) {
      return res.status(404).json({
        result: false,
        message: '등록된 유저 정보가 없습니다',
      });
    }

    const review = await createReview({
      userId: _id,
      movieId,
      image,
      content,
      starpoint,
    });

    if (!review) {
      throw new Error('리뷰 등록 실패');
    }

    return res.json({
      result: true,
      data: review,
      message: '리뷰가 등록되었습니다.',
    });
  } catch (e) {
    return res.json({
      result: false,
      data: {},
      message: '리뷰 등록에 실패했습니다.',
    });
  }
});

reviewController.post('/totalcomments', async (req, res) => {
  const { movieId } = req.body;

  let email = null;
  if (req.session.user) {
    email = req.session.user.email;
  }

  const userId = await findUserEmailId({ email });

  const reviews = await findMovieIdCommentsArray({ movieId });
  const totalstarpoint = await findMovieIdStarScoreSum({ movieId });

  if (reviews.length === 0) {
    throw new Error('전체 리뷰 등록 실패');
  }

  if (!totalstarpoint) {
    throw new Error('별점 조회 실패');
  }

  const finedReview = reviews.map((review) => ({
    ...review,
    totalLike: review.like.length || 1,
    totalDisLike: review.dislike.length || 1,
    like:
      review.like.length !== 0
        ? review.like.some(
            (item) => JSON.stringify(item) === JSON.stringify(userId)
          )
        : false,
    dislike:
      review.dislike.length !== 0
        ? review.dislike.some(
            (item) => JSON.stringify(item) === JSON.stringify(userId)
          )
        : false,
  }));

  try {
    return res.json({
      result: true,
      data: {
        reviews: finedReview,
        totalstarpoint: totalstarpoint.totalStarScore.toFixed(1),
      },
      message: '전체 리뷰 조회 성공',
    });
  } catch (e) {
    return res.json({
      result: false,
      message: '전체 리뷰 조회 실패',
    });
  }
});

reviewController.post('/likes', checklogin, async (req, res) => {
  const { commentId, likes } = req.body;
  const { email } = req.session.user;

  if (!email) {
    return res.status(401).json({
      result: false,
      message: '로그인 유지 시간이 만료되었습니다. 다시 로그인 해주세요.',
    });
  }

  if (emptyChecker({ commentId })) {
    return res.status(404).json({
      result: false,
      message: '리뷰를 참조할 수 없습니다. 새로고침 해주세요.',
    });
  }

  try {
    const userId = await findUserEmailId({ email });

    if (!userId) {
      return res.status(404).json({
        result: false,
        message: '일치하는 유저 정보를 찾을 수 없습니다.',
      });
    }

    const result = await updateLikeCommentIdLikes({
      commentId,
      userId,
      likes,
    });

    if (!result) {
      return res.status(500).json({
        result: false,
        message: '좋아요/싫어요 등록에 실패했습니다.',
      });
    }

    return res.json({
      result: true,
      message: result.message,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: '좋아요/싫어요 등록 실패',
    });
  }
});

module.exports = reviewController;
