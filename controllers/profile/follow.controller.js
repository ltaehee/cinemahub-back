const User = require("../schemas/user/user.schema");

// 팔로우 요청
const followUser = async (req, res) => {
  try {
    const loggedInUserEmail = req.session.user.email;
    const targetNickname = req.params.nickname;

    // 현재 로그인한 유저 찾기
    const loggedInUser = await User.findOne({ email: loggedInUserEmail });
    if (!loggedInUser) {
      return res
        .status(404)
        .json({ message: "로그인한 사용자를 찾을 수 없습니다." });
    }

    // 팔로우할 대상 유저 찾기
    const targetUser = await User.findOne({ nickname: targetNickname });
    if (!targetUser) {
      return res
        .status(404)
        .json({ message: "팔로우할 사용자를 찾을 수 없습니다." });
    }

    // 이미 팔로우했는지 확인
    if (loggedInUser.following.includes(targetUser._id)) {
      return res.status(400).json({ message: "이미 팔로우한 사용자입니다." });
    }

    // 팔로우 관계 추가
    loggedInUser.following.push(targetUser._id);
    targetUser.followers.push(loggedInUser._id);

    await loggedInUser.save();
    await targetUser.save();

    return res.status(200).json({ message: "팔로우 성공" });
  } catch (error) {
    console.error("팔로우 오류:", error);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

// 언팔로우 요청
const unfollowUser = async (req, res) => {
  try {
    const loggedInUserEmail = req.session.user.email;
    const targetNickname = req.params.nickname;

    const loggedInUser = await User.findOne({ email: loggedInUserEmail });
    const targetUser = await User.findOne({ nickname: targetNickname });

    if (!loggedInUser || !targetUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 팔로우 관계 삭제
    loggedInUser.following = loggedInUser.following.filter(
      (id) => id.toString() !== targetUser._id.toString()
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== loggedInUser._id.toString()
    );

    await loggedInUser.save();
    await targetUser.save();

    return res.status(200).json({ message: "언팔로우 성공" });
  } catch (error) {
    console.error("언팔로우 오류:", error);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

// 현재 팔로우 상태 확인
const checkFollowingStatus = async (req, res) => {
  try {
    const loggedInUserEmail = req.session.user.email;
    const targetNickname = req.params.nickname;

    const loggedInUser = await User.findOne({ email: loggedInUserEmail });
    const targetUser = await User.findOne({ nickname: targetNickname });

    if (!loggedInUser || !targetUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const isFollowing = loggedInUser.following.includes(targetUser._id);
    return res.status(200).json({ isFollowing });
  } catch (error) {
    console.error("팔로우 상태 확인 오류:", error);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
};

module.exports = { followUser, unfollowUser, checkFollowingStatus };
