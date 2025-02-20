const User = require("../../schemas/user/user.schema");

const createUser = async ({ email, nickname, profile, role = "user" }) => {
  try {
    const result = await User.create({
      email,
      nickname,
      profile,
      role,
    });
    if (!result) throw new Error("유저 생성 실패");
    return result.toObject();
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const findUserEmailBoolean = async ({ email }) => {
  try {
    const result = await User.find({ email }).lean();
    // []이 나옴 true로 인식
    return result.length !== 0 && result;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const findUserNicknameBoolean = async ({ nickname }) => {
  try {
    const result = await User.find({ nickname }).lean();
    // []이 나옴 true로 인식
    return result.length !== 0 && result;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

// 관리자페이지에서 유저 검색
const findUserNicknameByKeyword = async (keyword) => {
  try {
    const user = await User.find({
      nickname: { $regex: `^${keyword}`, $options: "i" }, // keyword로 시작하는 모든 이름 검색
    });
    return user;
  } catch (err) {
    console.error("유저 검색 오류: ", err);
    throw new Error(err.message);
  }
};

module.exports = {
  createUser,
  findUserEmailBoolean,
  findUserNicknameBoolean,
  findUserNicknameByKeyword,
};
