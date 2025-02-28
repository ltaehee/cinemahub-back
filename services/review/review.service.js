const Review = require("../../schemas/review/review.schema");
const emptyChecker = require("../../utils/emptyChecker");

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
      throw new Error("리뷰 등록 실패");
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

    return { message: "신고 접수 성공" };
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const findMovieIdCommentsArray = async ({ movieId, skip, limit }) => {
  try {
    const result = await Review.find({ movieId })
      .skip(skip)
      .limit(limit)
      .populate("userId", "profile nickname")
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
        },
      },
      {
        $group: {
          _id: null,
          totalStarScore: { $avg: "$starpoint" },
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
    const result = await Review.find({ movieId }).countDocuments();
    return result;
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
        return { message: "좋아요를 눌렀어요." };
      } else {
        return { message: "이미 좋아요를 눌렀어요." };
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
        return { message: "싫어요를 눌렀어요." };
      } else {
        return { message: "이미 싫어요를 눌렀어요." };
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
        return { message: "좋아요 취소" };
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
        return { message: "싫어요 취소" };
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
      throw new Error("리뷰 조회 실패");
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

// 모든 신고 리뷰 조회
const getReportedReviews = async (page, limit) => {
  const skip = page * limit;
  const parsedLimit = parseInt(limit, 10);
  try {
    const reportedReviews = await Review.find({
      reportlist: { $ne: [] }, // reportlist가 빈 배열이 아닌 리뷰만 조회
      reportstatus: { $ne: true },
    })
      .select("content imgUrls reportlist.reason reportlist._id")
      .populate("userId", "email")
      .populate("reportlist.user", "email")
      .sort("-createdAt");
    // .skip(skip)
    // .limit(parsedLimit);

    if (reportedReviews.length === 0) {
      console.log("조회된 신고 리뷰가 없음");
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

    // 신고 리뷰 총합(같은 리뷰의 여러 신고도 포함)
    // const totalCount = reportedReviews.reduce(
    //   (acc, review) => acc + review.reportlist.length,
    //   0
    // );

    return { reportResult: paginatedReports, totalCount };
  } catch (err) {
    console.error("신고 리뷰 조회 오류: ", err);
    throw new Error(err.message);
  }
};

// 단일 신고 리뷰 삭제(Soft Delete)
const patchReviewByReportId = async (_id) => {
  try {
    const result = await Review.findOneAndUpdate(
      { "reportlist._id": _id },
      { $set: { reportstatus: true } },
      { new: true }
    );

    if (!result) {
      throw new Error("해당 신고 ID를 가진 리뷰를 찾을 수 없습니다.");
    }

    return result;
  } catch (err) {
    console.error("리뷰 신고 처리중 오류 발생: ", err);
  }
};

// 다중 신고 리뷰 삭제(Soft Delete)
const patchReviewsByReportIds = async (reportIds) => {
  try {
    const result = await Review.updateMany(
      { "reportlist._id": { $in: reportIds } },
      { $set: { reportstatus: true } }
    );

    if (result.matchedCount === 0) {
      throw new Error("해당 신고 ID를 가진 리뷰를 찾을 수 없습니다.");
    }

    return result;
  } catch (err) {
    console.error("다중 리뷰 신고 처리중 오류 발생: ", err);
  }
};
module.exports = {
  createReview,
  createReport,
  findCommentIdComment,
  updateLikeCommentIdLikes,
  findMovieIdCommentsArray,
  findMovieIdStarScoreSum,
  findUserReviews,
};
