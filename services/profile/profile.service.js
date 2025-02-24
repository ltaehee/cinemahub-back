const User = require("../../schemas/user/user.schema");

// 유저 정보 가져오기
const findUserByNickname = async (nickname) => {
  try {
    const user = await User.findOne({ nickname, deletedAt: null })
      .populate("followers", "nickname email profileImg deletedAt")
      .populate("following", "nickname email profileImg deletedAt")
      .lean();
    return user;
  } catch (e) {
    throw new Error("유저 조회 실패");
  }
};

const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email, deletedAt: null })
      .populate("followers", "nickname email profileImg deletedAt")
      .populate("following", "nickname email profileImg deletedAt");
    return user;
  } catch (e) {
    throw new Error("유저 조회 실패");
  }
};

// 유저 프로필 업데이트
const updateUserProfile = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true }).lean();
};
module.exports = {
  updateUserProfile,
  findUserByNickname,
  findUserByEmail,
};
