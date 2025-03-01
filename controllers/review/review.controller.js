const checklogin = require('../../middlewares/checklogin');
const { findUserEmailId } = require('../../services/user/user.service');
const {
  createReview,
  updateLikeCommentIdLikes,
  findMovieIdCommentsArray,
  findMovieIdStarScoreSum,
  findCommentIdComment,
  findUserReviews,
  createReport,
  deleteCommentIdComment,
  updateCommentIdComment,
  getMovieReviewLength,
} = require('../../services/review/review.service');
const emptyChecker = require('../../utils/emptyChecker');
const {
  findUserByNickname,
} = require('../../services/profile/profile.service');

const Review = require('../../schemas/review/review.schema');

const reviewController = require('express').Router();

reviewController.post('/register', checklogin, async (req, res) => {
  const { movieId, imgUrls, content, starpoint } = req.body;
  const { email } = req.session.user;

  if (emptyChecker({ movieId, content, starpoint })) {
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
      imgUrls,
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

reviewController.post('/update', checklogin, async (req, res) => {
  const { commentId, imgUrls, content, starpoint } = req.body;
  const { email } = req.session.user;

  if (emptyChecker({ commentId, content, starpoint })) {
    return res
      .status(400)
      .json({ result: false, message: '수정 내용을 불라올 수 없어요.' });
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

    const review = await updateCommentIdComment({
      commentId,
      imgUrls,
      content,
      starpoint,
    });

    if (!review) {
      throw new Error('리뷰 수정 실패');
    }

    return res.json({
      result: true,
      data: review,
      message: '리뷰 수정 성공 ',
    });
  } catch (e) {
    return res.json({
      result: false,
      data: {},
      message: '리뷰 수정 실패',
    });
  }
});

reviewController.post('/delete', checklogin, async (req, res) => {
  const { commentId } = req.body;
  const { email } = req.session.user;

  if (!email) {
    return res.status(401).json({
      result: false,
      message: '로그인 유지 시간이 만료되었습니다. 다시 로그인 해주세요.',
    });
  }

  if (emptyChecker({ commentId })) {
    return res
      .status(400)
      .json({ result: false, message: '리뷰를 참조할 수 없습니다.' });
  }

  try {
    const userId = await findUserEmailId({ email });

    if (!userId) {
      return res.status(404).json({
        result: false,
        message: '유저 조회에 실패했습니다.',
      });
    }

    const comment = await findCommentIdComment({ commentId });

    if (comment.length === 0) {
      return res.status(404).json({
        result: false,
        message: '리뷰를 참조하지 못했습니다.',
      });
    }

    const IsOwner =
      JSON.stringify(userId) === JSON.stringify(comment[0].userId);

    if (!IsOwner) {
      return res.status(500).json({
        result: false,
        message: '리뷰를 삭제할 권한이 없습니다.',
      });
    }

    const result = await deleteCommentIdComment({
      commentId,
    });

    if (result.length === 0) {
      return res.status(500).json({
        result: false,
        message: '리뷰를 삭제할 권한이 없습니다.',
      });
    }

    return res.json({
      result: true,
      message: '리뷰 삭제 성공',
    });
  } catch (e) {
    return res.json({
      result: false,
      message: '리뷰 삭제 실패',
    });
  }
});

reviewController.get('/:movieId', async (req, res) => {
  const { movieId } = req.params;
  try {
    const reviewScore = await findMovieIdStarScoreSum({ movieId });
    const reviewLength = await getMovieReviewLength({ movieId });

    return res.json({ reviewScore, reviewLength });
  } catch (error) {
    console.error(`영화 리뷰 점수 요청 에러: ${error.message}`);
    res.status(500).json({ message: '영화 리뷰 점수 요청 에러' });
  }
});

reviewController.post('/totalcomments', async (req, res) => {
  const { movieId } = req.body;

  let email = null;
  if (req.session.user) {
    email = req.session.user.email;
  }

  try {
    const userId = await findUserEmailId({ email });
    const reviews = await findMovieIdCommentsArray({ movieId });

    if (reviews.length === 0) {
      return res.status(404).json({
        result: false,
        message: '조회내역이 없습니다.',
      });
    }

    const finedReview = reviews
      .filter(({ deletedAt }) => deletedAt === null)
      .map((review) => ({
        ...review,
        IsOwner: JSON.stringify(userId) === JSON.stringify(review.userId._id),
        totalLike: review.like.length || 0,
        totalDisLike: review.dislike.length || 0,
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

    return res.json({
      result: true,
      data: {
        reviews: finedReview,
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

    const comment = await findCommentIdComment({ commentId });

    if (comment.length === 0) {
      return res.status(500).json({
        result: false,
        message: '리뷰를 참조하지 못했습니다.',
      });
    }

    return res.json({
      result: true,
      data: {
        totalLike: comment[0].like.length,
        totalDisLike: comment[0].dislike.length,
      },
      message: result.message,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: '좋아요/싫어요 등록 실패',
    });
  }
});

reviewController.post('/report', checklogin, async (req, res) => {
  const { commentId, reason } = req.body;
  const { email } = req.session.user;

  if (!email) {
    return res.status(401).json({
      result: false,
      message: '로그인 유지 시간이 만료되었습니다. 다시 로그인 해주세요.',
    });
  }

  if (emptyChecker({ commentId })) {
    return res.status(400).json({
      result: false,
      message: '리뷰를 참조할 수 없습니다. 새로고침 해주세요.',
    });
  }

  if (emptyChecker({ reason })) {
    return res.status(400).json({
      result: false,
      message: '신고 내용을 입력해주세요.',
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

    const result = await createReport({
      commentId,
      userId,
      reason,
    });

    if (!result) {
      return res.status(500).json({
        result: false,
        message: '신고글 등록에 실패했습니다.',
      });
    }

    return res.json({
      result: true,
      message: result.message,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: '신고글 등록 실패',
    });
  }
});

/* 프로필 페이지 리뷰조회 */
reviewController.get('/user-reviews/:nickname', async (req, res) => {
  const { nickname } = req.params;
  const { page, limit } = req.query;
  const offset = (page - 1) * limit;

  try {
    const targetUser = await findUserByNickname(nickname);
    if (!targetUser) {
      return res.status(404).json({
        result: false,
        message: '해당 닉네임의 사용자가 없습니다.',
      });
    }

    // 전체 리뷰 조회
    const allReviews = await findUserReviews({ userId: targetUser._id });

    const total = allReviews.length;

    // 최신순 정렬
    const sortedReviews = allReviews.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // 페이지네이션 적용
    const paginatedReviews = sortedReviews.slice(offset, offset + limit);

    const finedReview = paginatedReviews.map((review) => ({
      ...review,
      totalLike: review.like.length || 0,
      totalDisLike: review.dislike.length || 0,
    }));

    return res.json({
      result: true,
      data: finedReview,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      message: '사용자 리뷰 조회 성공',
    });
  } catch (e) {
    console.error('서버 오류:', e);
    return res.status(500).json({
      result: false,
      message: '사용자 리뷰 조회에 실패했습니다.',
    });
  }
});

module.exports = reviewController;
