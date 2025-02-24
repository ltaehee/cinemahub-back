const User = require("../../schemas/user/user.schema");
const { findUserByNickname, findUserByEmail } = require("./profile.service");

// 팔로우 요청
const followUserService = async (loggedInUserEmail, targetNickname) => {
  const loggedInUser = await findUserByEmail(loggedInUserEmail);
  const targetUser = await findUserByNickname(targetNickname);

  if (!loggedInUser || !targetUser) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }

  await User.updateOne(
    { email: loggedInUserEmail },
    { $push: { following: targetUser._id } }
  );

  await User.updateOne(
    { nickname: targetNickname },
    { $push: { followers: loggedInUser._id } }
  );
  /* loggedInUser.following.push(targetUser._id);
  targetUser.followers.push(loggedInUser._id); */

  /* await loggedInUser.save();
  await targetUser.save(); */

  return { message: "팔로우 성공" };
};

// 언팔로우 요청
const unfollowUserService = async (loggedInUserEmail, targetNickname) => {
  const loggedInUser = await findUserByEmail(loggedInUserEmail);
  const targetUser = await findUserByNickname(targetNickname);

  if (!loggedInUser || !targetUser) {
    throw new Error("사용자를 찾을 수 없습니다.");
  }
  await User.updateOne(
    { email: loggedInUserEmail },
    { $pull: { following: targetUser._id } }
  );

  await User.updateOne(
    { nickname: targetNickname },
    { $pull: { followers: loggedInUser._id } }
  );

  /* loggedInUser.following = loggedInUser.following.filter(
    (id) => id.toString() !== targetUser._id.toString()
  );
  targetUser.followers = targetUser.followers.filter(
    (id) => id.toString() !== loggedInUser._id.toString()
  ); */

  /*  await loggedInUser.save();
  await targetUser.save(); */

  return { message: "언팔로우 성공" };
};

module.exports = {
  followUserService,
  unfollowUserService,
};
