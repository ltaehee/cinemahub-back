const profileController = require('express').Router();
const {
  updateUserProfile,
  findUserByNickname,
  findUserByEmail,
} = require('../../services/profile/profile.service');
const { findUserNicknameBoolean } = require('../../services/user/user.service');

// 로그인한 유저 프로필 조회
profileController.get('/me', async (req, res) => {
  try {
    if (!req.session.user || !req.session.user.email) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const loggedInUserEmail = req.session.user.email;
    const loggedInUser = await findUserByEmail(loggedInUserEmail);

    if (!loggedInUser) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    return res.status(200).json({
      userId: loggedInUser._id,
      email: loggedInUser.email,
      nickname: loggedInUser.nickname,
      introduce: loggedInUser.introduce || '',
      profile: loggedInUser.profile || '',
      followers: loggedInUser.followers || [],
      following: loggedInUser.following || [],
      role: loggedInUser.role || 'user',
    });
  } catch (error) {
    console.error('로그인한 유저 프로필 조회 오류:', error);
    return res.status(500).json({ message: '서버 오류 발생' });
  }
});

// url 기준 프로필 조회
profileController.get('/:nickname', async (req, res) => {
  try {
    const { nickname } = req.params;

    const user = await findUserByNickname(nickname);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 비로그인 상태일 때
    if (!req.session.user || !req.session.user.email) {
      return res.status(200).json({
        userId: user._id,
        email: user.email,
        nickname: user.nickname,
        introduce: user.introduce || '',
        profile: user.profile || '',
        role: user.role || 'user',
        isOwnProfile: false,
        isFollowing: false,
      });
    }

    // 로그인한 상태일 때 로그인한 유저의 이메일 가져오기
    const loggedInUserEmail = req.session.user.email;

    const loggedInUser = await findUserByEmail(loggedInUserEmail);
    if (!loggedInUser) {
      return res
        .status(404)
        .json({ message: '로그인한 사용자를 찾을 수 없습니다.' });
    }
    // 팔로우 상태 확인
    const isFollowing = user.followers.some(
      (follower) => follower.email === loggedInUserEmail
    );

    return res.status(200).json({
      userId: user._id,
      email: user.email,
      nickname: user.nickname,
      introduce: user.introduce || '',
      profile: user.profile || '',
      role: user.role || 'user',
      isOwnProfile: loggedInUser.nickname === user.nickname,
      isFollowing,
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    return res.status(500).json({ message: '서버 오류 발생' });
  }
});

// 프로필 업데이트
profileController.patch('/profile-update', async (req, res) => {
  try {
    const email = req.session.user.email;
    const user = await findUserByEmail(email);

    if (!user) {
      console.error('사용자를 찾을 수 없음');
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const { nickname, introduce, profile } = req.body;
    console.log('수정할 데이터', { nickname, introduce, profile });

    const updatedUser = await updateUserProfile(user._id, {
      nickname,
      introduce,
      profile,
    });

    console.log('업데이트된 사용자', updatedUser);

    return res
      .status(200)
      .json({ message: '프로필 업데이트 성공', user: updatedUser });
  } catch (error) {
    console.error('서버 오류 발생:', error);
    return res
      .status(500)
      .json({ message: '서버 오류 발생', error: error.message });
  }
});

// 닉네임 중복체크
profileController.post('/check-nickname', async (req, res) => {
  const { nickname, currentNickname } = req.body;

  if (!nickname) {
    return res.status(400).json({
      result: false,
      message: '닉네임을 입력해주세요.',
    });
  }

  if (nickname === currentNickname) {
    return res.json({
      result: true,
      nickname,
      message: '현재 사용 중인 닉네임입니다.',
    });
  }
  try {
    const existNickname = await findUserNicknameBoolean({ nickname });
    if (existNickname) {
      return res.json({
        result: false,
        message: '동일한 닉네임이 존재합니다. 닉네임을 추천해드릴게요.',
      });
    }
    return res.json({
      result: true,
      nickname,
      message: '사용 가능한 닉네임입니다',
    });
  } catch (e) {
    console.error(e.message);
    return res.json({
      result: false,
      message: e.message,
    });
  }
});

module.exports = profileController;
