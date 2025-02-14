const User = require('../../schemas/user/user.schema');

const createUser = async ({ email, nickname, profile, role = 'user' }) => {
  try {
    const result = await User.create({
      email,
      nickname,
      profile,
      role,
    });
    if (!result) throw new Error('유저 생성 실패');
    return result.toObject();
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const findUserEmailBoolean = async ({ email }) => {
  try {
    const result = await User.find({ email }).lean();
    // []이 나옴 true로 인식
    if (result.length !== 0 && result) {
      return true;
    }
    return false;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

module.exports = { createUser, findUserEmailBoolean };
