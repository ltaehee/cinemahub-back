const followController = require('express').Router();
const {
  followUserService,
  unfollowUserService,
} = require('../../services/profile/follow.service');
const {
  findUserByNickname,
} = require('../../services/profile/profile.service');

// 팔로우 요청
followController.post('/:nickname', async (req, res) => {
  try {
    const loggedInUserEmail = req.session.user.email;
    const targetNickname = req.params.nickname;

    const result = await followUserService(loggedInUserEmail, targetNickname);
    return res.status(200).json(result);
  } catch (error) {
    console.error('팔로우 오류:', error);
    return res.status(500).json({ message: error.message });
  }
});

// 언팔로우 요청
followController.delete('/:nickname', async (req, res) => {
  try {
    const loggedInUserEmail = req.session.user.email;
    const targetNickname = req.params.nickname;

    const result = await unfollowUserService(loggedInUserEmail, targetNickname);
    return res.status(200).json(result);
  } catch (error) {
    console.error('언팔로우 오류:', error);
    return res.status(500).json({ message: error.message });
  }
});

// 팔로워 리스트 조회 (페이지네이션)
followController.get('/followers/:nickname', async (req, res) => {
  const { nickname } = req.params;
  const { page, limit } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 닉네임으로 유저 찾기
    const user = await findUserByNickname(nickname);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const followersData = user.followers
      .slice(offset, offset + limit) // 페이지네이션
      .map((follower) => ({
        _id: follower._id,
        nickname: follower.nickname,
        email: follower.email,
        profile: follower.profile,
        deletedAt: follower.deletedAt,
      }));

    console.log('팔로워리스트', followersData);

    return res.status(200).json({
      data: followersData,
      total: user.followers.length,
      currentPage: page,
      totalPages: Math.ceil(user.followers.length / limit),
    });
  } catch (error) {
    console.error('팔로워 리스트 조회 오류:', error);
    return res.status(500).json({ message: '서버 오류 발생' });
  }
});

// 팔로잉 리스트 조회 (페이지네이션)
followController.get('/following/:nickname', async (req, res) => {
  const { nickname } = req.params;
  const { page, limit } = req.query;
  const offset = (page - 1) * limit;

  try {
    const user = await findUserByNickname(nickname);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const followingData = user.following
      .slice(offset, offset + limit)
      .map((following) => ({
        _id: following._id,
        nickname: following.nickname,
        email: following.email,
        profile: following.profile,
        deletedAt: following.deletedAt,
      }));
    console.log('팔로잉리스트', followingData);

    return res.status(200).json({
      data: followingData,
      total: user.following.length, // 전체 팔로잉 수
      currentPage: page,
      totalPages: Math.ceil(user.following.length / limit),
    });
  } catch (error) {
    console.error('팔로잉 리스트 조회 오류:', error);
    return res.status(500).json({ message: '서버 오류 발생' });
  }
});

module.exports = followController;
