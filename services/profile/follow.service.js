const { findUserByNickname, findUserByEmail } = require("./profile.service");

// 팔로우 요청
const followUserService = async (loggedInUserEmail, targetNickname) => {
  const loggedInUser = await findUserByEmail(loggedInUserEmail);
  const targetUser = await findUserByNickname(targetNickname);

  if (!loggedInUser || !targetUser) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  if (loggedInUser.following.includes(targetUser._id)) {
    throw new Error("이미 팔로우한 사용자입니다.");
  }

  loggedInUser.following.push(targetUser._id);
  targetUser.followers.push(loggedInUser._id);

  await loggedInUser.save();
  await targetUser.save();

  return { message: "팔로우 성공" };
};

// 언팔로우 요청
const unfollowUserService = async (loggedInUserEmail, targetNickname) => {
  const loggedInUser = await findUserByEmail(loggedInUserEmail);
  const targetUser = await findUserByNickname(targetNickname);

  if (!loggedInUser || !targetUser) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  loggedInUser.following = loggedInUser.following.filter(
    (id) => id.toString() !== targetUser._id.toString()
  );
  targetUser.followers = targetUser.followers.filter(
    (id) => id.toString() !== loggedInUser._id.toString()
  );

  await loggedInUser.save();
  await targetUser.save();

  return { message: "언팔로우 성공" };
};

// 팔로우 상태 확인
const checkFollowingStatusService = async (
  loggedInUserEmail,
  targetNickname
) => {
  const loggedInUser = await findUserByEmail(loggedInUserEmail);
  const targetUser = await findUserByNickname(targetNickname);

  if (!loggedInUser || !targetUser) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  return { isFollowing: loggedInUser.following.includes(targetUser._id) };
};

module.exports = {
  followUserService,
  unfollowUserService,
  checkFollowingStatusService,
};
