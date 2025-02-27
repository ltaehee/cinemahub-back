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

const findUserEmailId = async ({ email }) => {
  try {
    const result = await User.find({ email }).lean();
    // []이 나옴 true로 인식
    return result.length !== 0 && String(result[0]._id);
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

const findUserNicknameBoolean = async ({ nickname }) => {
  try {
    const result = await User.find({ nickname, deletedAt: null }).lean();
    // []이 나옴 true로 인식
    return result.length !== 0 && result;
  } catch (e) {
    if (e instanceof Error) throw new Error(e.message);
  }
};

// 관리자페이지에서 유저 검색
const findUserNicknameByKeyword = async (keyword, page, limit) => {
  const skip = page * limit;
  const parsedLimit = parseInt(limit, 10);
  try {
    // 검색된 전체 유저 수 계산
    const totalCount = await User.countDocuments({
      nickname: { $regex: `^${keyword}`, $options: "i" },
      deletedAt: null,
    });

    const result = await User.find({
      nickname: { $regex: `^${keyword}`, $options: "i" }, // keyword로 시작하는 모든 이름 검색
      deletedAt: null, // 삭제되지 않은 유저만 검색
    })
      .sort("-createdAt")
      .skip(skip)
      .limit(parsedLimit);

    return {
      users: result,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / parsedLimit),
    };
  } catch (err) {
    console.error("유저 검색 오류: ", err);
    throw new Error(err.message);
  }
};

// 모든 유저 조회
const getUsers = async (page, limit) => {
  const skip = page * limit;
  const parsedLimit = parseInt(limit, 10); // 10진수로 변환
  try {
    const users = await User.find({ deletedAt: null })
      .sort("-createdAt")
      .skip(skip)
      .limit(parsedLimit);

    const totalCount = await User.countDocuments({ deletedAt: null });

    return {
      users,
      totalCount,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalCount / parsedLimit),
    };
  } catch (err) {
    console.error("전체 유저 조회 오류: ", err);
    throw new Error(err.message);
  }
};

// 단일 유저 삭제(Soft Delete)
const patchUserByEmail = async (email) => {
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
const patchUsersByEmails = async (emails) => {
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
  findUserEmailId,
  findUserNicknameByKeyword,
  patchUserByEmail,
  patchUsersByEmails,
  getUsers,
};
