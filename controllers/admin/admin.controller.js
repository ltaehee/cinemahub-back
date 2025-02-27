const {
  getReportedReviews,
  patchReviewByEmail,
  patchReviewsByEmails,
  patchReviewByReportId,
  patchReviewsByReportIds,
} = require("../../services/review/review.service");
const {
  getUsers,
  patchUserByEmail,
  patchUsersByEmails,
} = require("../../services/user/user.service");

const adminController = require("express").Router();

// 유저 상태 변경
adminController.patch("/users", async (req, res) => {
  const { emails } = req.query;
  console.log("emails: ", emails);

  const emailArray = typeof emails === "string" ? emails.split(",") : emails;
  console.log("emailArray: ", emailArray);
  if (!emailArray || emailArray.length === 0) {
    return res
      .status(400)
      .json({ message: "삭제할 유저 이메일을 제공하세요." });
  }

  try {
    if (emailArray.length === 1) {
      await patchUserByEmail(emailArray[0]);
    } else {
      await patchUsersByEmails(emailArray);
    }

    res.json({ message: "유저 상태 변경 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// 신고 리뷰 상태 변경
adminController.patch("/reviews", async (req, res) => {
  const { _id } = req.query;
  console.log("_id: ", _id);

  const _idArray = typeof _id === "string" ? _id.split(",") : _id;
  console.log("_idArray: ", _idArray);

  if (!_idArray || _idArray.length === 0) {
    return res
      .status(400)
      .json({ message: "처리할 리뷰 이메일을 제공하세요." });
  }

  try {
    if (_idArray.length === 1) {
      await patchReviewByReportId(_idArray[0]);
    } else {
      await patchReviewsByReportIds(_idArray);
    }

    res.json({ message: "리뷰 신고 상태 변경 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// 전체 유저 조회
adminController.get("/users", async (req, res) => {
  const { page, limit } = req.query;
  try {
    const result = await getUsers(page, limit);
    return res.json(result);
  } catch (err) {
    res
      .status(500)
      .json({ message: "전체 유저 조회 실패", error: err.message });
  }
});

// 전체 신고 리뷰 조회
adminController.get("/review", async (req, res) => {
  const { page, limit } = req.query;
  try {
    const result = await getReportedReviews(page, limit);
    return res.json(result);
  } catch (err) {
    res
      .status(500)
      .json({ message: "신고 리뷰 조회 실패", error: err.message });
  }
});
module.exports = adminController;
