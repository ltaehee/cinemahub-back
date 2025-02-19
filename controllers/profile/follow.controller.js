const followController = require("express").Router();
const {
  followUserService,
  unfollowUserService,
  checkFollowingStatusService,
} = require("../../services/profile/follow.service");

// 팔로우 요청
followController.post("/:nickname", async (req, res) => {
  try {
    const loggedInUserEmail = req.session.user.email;
    const targetNickname = req.params.nickname;

    const result = await followUserService(loggedInUserEmail, targetNickname);
    return res.status(200).json(result);
  } catch (error) {
    console.error("팔로우 오류:", error);
    return res.status(500).json({ message: error.message });
  }
});

// 언팔로우 요청
followController.delete("/:nickname", async (req, res) => {
  try {
    const loggedInUserEmail = req.session.user.email;
    const targetNickname = req.params.nickname;

    const result = await unfollowUserService(loggedInUserEmail, targetNickname);
    return res.status(200).json(result);
  } catch (error) {
    console.error("언팔로우 오류:", error);
    return res.status(500).json({ message: error.message });
  }
});

// 현재 팔로우 상태 확인
followController.get("/:nickname", async (req, res) => {
  try {
    const loggedInUserEmail = req.session.user.email;
    const targetNickname = req.params.nickname;

    const result = await checkFollowingStatusService(
      loggedInUserEmail,
      targetNickname
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("팔로우 상태 확인 오류:", error);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = followController;
