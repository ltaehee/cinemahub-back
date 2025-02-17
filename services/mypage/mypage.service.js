const User = require("../../schemas/user/user.schema");

// 유저 정보 가져오기
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  return user;
};

// 유저 프로필 업데이트
const updateUserProfile = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};
module.exports = {
  getUserById,
  updateUserProfile,
};
