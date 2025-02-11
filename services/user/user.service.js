const User = require('../schemas/user.schema');

const createUser = async ({ email, name, img }) => {
  try {
    const result = await User.create({ email: email, name: name, img: img });

    if (!result) throw new Error('유저 생성 실패');
    return result;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

module.exports = { createUser };
