const {
  getUserById,
  updateUserProfile,
} = require("../../services/mypage/mypage.service");

// 프로필 조회
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "서버 오류", error });
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
