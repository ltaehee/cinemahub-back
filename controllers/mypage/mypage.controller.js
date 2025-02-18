const {
  updateUserProfile,
  findUserByEmail,
} = require("../../services/mypage/mypage.service");

// 프로필 조회
const getProfile = async (req, res) => {
  try {
    const email = req.session.user.email;
    const user = await findUserByEmail({ email });

    if (!user) {
      console.error("사용자를 찾을 수 없음");
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    console.log("사용자 데이터:", user);
    return res.status(200).json(user);
  } catch (error) {
    console.error("서버 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "서버 오류 발생", error: error.message });
  }
};

// 프로필 업데이트
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, intro, profileImg } = req.body;

    const updatedUser = await updateUserProfile(userId, {
      name,
      intro,
    });

    return res
      .status(200)
      .json({ message: "프로필 업데이트 성공", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: "서버 오류", error });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
