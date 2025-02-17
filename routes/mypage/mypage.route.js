const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
} = require("../../controllers/mypage/mypage.controller");

// 프로필 조회
router.get("/profile", getProfile);

// 프로필 수정
router.patch("/profile-update", updateProfile);

module.exports = router;
