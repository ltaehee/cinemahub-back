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
    const result = await User.find({
      nickname: { $regex: `^${keyword}`, $options: "i" }, // keyword로 시작하는 모든 이름 검색
    });
    return result;
  } catch (err) {
    console.error("유저 검색 오류: ", err);
    throw new Error(err.message);
  }
};

// 단일 유저 삭제(Soft Delete)
const deleteUserByEmail = async (email) => {
  try {
    const result = await User.findOneAndUpdate(
      { email },
      { deletedAt: new Date() },
      { new: true }
    );

    if (!result) {
      throw new Error("해당 이메일의 유저를 찾을 수 없습니다.");
    }

    return result;
  } catch (err) {
    console.error("유저 삭제중 오류 발생: ", err);
    throw new Error(err.message);
  }
};

// 다중 유저 삭제(Soft Delete)
const deleteUsersByEmails = async (emails) => {
  try {
    const result = await User.updateMany(
      { email: { $in: emails } }, // email 값 중 일치하는 email 찾기
      { deletedAt: new Date() }
    );

    return result;
  } catch (err) {
    console.error("다중 유저 삭제중 오류 발생: ", err);
    throw new Error(err.message);
  }
};

module.exports = {
  createUser,
  findUserEmailBoolean,
  findUserNicknameBoolean,
  findUserNicknameByKeyword,
  deleteUserByEmail,
  deleteUsersByEmails,
};
