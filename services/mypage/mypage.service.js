const User = require("../../schemas/user/user.schema");

// 유저 정보 가져오기
const findUserByEmail = async ({ email }) => {
  try {
    const user = await User.findOne({ email }).lean();
    return user;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

// 유저 프로필 업데이트
const updateUserProfile = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};
module.exports = {
  updateUserProfile,
  findUserByEmail,
};
