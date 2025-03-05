const Review = require('../../schemas/review/review.schema');
const User = require('../../schemas/user/user.schema');
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

    if (result.length === 0) {
      throw new Error('리뷰 등록 실패');
    }

    const review = await Review.find({ _id: result._id })
      .populate('userId', 'profile nickname')
      .lean();

    if (review.length === 0) {
      throw new Error('리뷰 조회 실패');
    }
    return review;
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
    const result = await Review.find({
      movieId,
    })
      .skip(skip)
      .limit(limit)
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
          reportstatus: false,
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

const getMovieReviewLength = async ({ movieId }) => {
  try {
    const result = await Review.find({ movieId }).countDocuments({
      deletedAt: null,
      reportstatus: false,
    });
    return result;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const updateLikeCommentIdLikes = async ({ userId, commentId, likes }) => {
  // _id는 Object이므로 String으로 변환
  try {
    const result = await findCommentIdComment({ commentId });

    const includedLike = result[0].like.some(
      (item) => JSON.stringify(item) === JSON.stringify(userId)
    );

    const includeddisLike = result[0].dislike.some(
      (item) => JSON.stringify(item) === JSON.stringify(userId)
    );

    if (likes.like === true && likes.dislike === false) {
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
    } else if (likes.like === false && likes.dislike === true) {
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
    } else if (likes.like === false && likes.dislike === false) {
      if (includedLike) {
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

      if (includeddisLike) {
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
    } else {
      return false;
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
    const result = await Review.find({
      userId,
      deletedAt: { $eq: null },
    })
      .skip(skip)
      .limit(limit)
      .lean();

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

// 모든 신고 리뷰 조회
const getReportedReviews = async (page, limit) => {
  const skip = page * limit;
  const parsedLimit = parseInt(limit, 10);
  try {
    const reportedReviews = await Review.find({
      reportlist: { $ne: [] }, // reportlist가 빈 배열이 아닌 리뷰만 조회
      reportstatus: { $ne: true },
    })
      .select('content imgUrls reportlist.reason reportlist._id')
      .populate('userId', 'email')
      .populate('reportlist.user', 'email')
      .sort('-createdAt');

    if (reportedReviews.length === 0) {
      console.log('조회된 신고 리뷰가 없음');
    }

    const allReports = reportedReviews.flatMap((review) =>
      review.reportlist.map((report) => ({
        _id: report._id,
        reportedEmail: report.user.email, // 신고한 유저 이메일
        reason: report.reason,
        email: review.userId.email, // 신고당한 유저 이메일
        content: review.content,
        imgUrls: review.imgUrls,
      }))
    );

    const paginatedReports = allReports.slice(skip, skip + parsedLimit);
    const totalCount = allReports.length;

    return { reportResult: paginatedReports, totalCount };
  } catch (err) {
    console.error('신고 리뷰 조회 오류: ', err);
    throw new Error(err.message);
  }
};

// 신고 리뷰 관련 데이터 검색
const findReviewDataByKeyword = async (keyword, page, limit) => {
  const skip = page * limit;
  const parsedLimit = parseInt(limit, 10);

  try {
    // 검색된 리뷰의 총 개수 계산
    const totalCount = await Review.countDocuments({
      reportstatus: { $ne: true },
      reportlist: { $ne: [] },
      content: { $regex: `${keyword}`, $options: 'i' },
    });

    const results = await Review.find({
      reportstatus: { $ne: true },
      reportlist: { $ne: [] },
      content: { $regex: `${keyword}`, $options: 'i' }, // 리뷰 내용에 검색어가 포함된 리뷰만 조회
    })
      .select('content imgUrls reportlist.reason reportlist._id')
      .populate('userId', 'email')
      .populate('reportlist.user', 'email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parsedLimit);

    const allReports = results.flatMap((review) =>
      review.reportlist.map((report) => ({
        _id: report._id,
        reportedEmail: report.user.email, // 신고한 유저 이메일
        reason: report.reason,
        email: review.userId.email, // 신고당한 유저 이메일
        content: review.content,
        imgUrls: review.imgUrls,
      }))
    );

    return { reportResult: allReports, totalCount };
  } catch (err) {
    console.error('신고 리뷰 관련 정보 조회 오류: ', err);
    throw new Error(err.message);
  }
};

// 단일 신고 리뷰 삭제(Soft Delete)
const patchReviewByReportId = async (_id) => {
  try {
    const result = await Review.findOneAndUpdate(
      { 'reportlist._id': _id },
      { $set: { reportstatus: true } },
      { new: true }
    );

    if (!result) {
      throw new Error('해당 신고 ID를 가진 리뷰를 찾을 수 없습니다.');
    }

    return result;
  } catch (err) {
    console.error('리뷰 신고 처리중 오류 발생: ', err);
  }
};

// 다중 신고 리뷰 삭제(Soft Delete)
const patchReviewsByReportIds = async (reportIds) => {
  try {
    const result = await Review.updateMany(
      { 'reportlist._id': { $in: reportIds } },
      { $set: { reportstatus: true } }
    );

    if (result.matchedCount === 0) {
      throw new Error('해당 신고 ID를 가진 리뷰를 찾을 수 없습니다.');
    }

    return result;
  } catch (err) {
    console.error('다중 리뷰 신고 처리중 오류 발생: ', err);
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
  getReportedReviews,
  findReviewDataByKeyword,
  patchReviewByReportId,
  patchReviewsByReportIds,
  getMovieReviewLength,
};
