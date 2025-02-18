const loginController = require('express').Router();

const {
  createUser,
  findUserEmailBoolean,
  findUserNicknameBoolean,
} = require('../../services/user/user.service');
const googleController = require('./oauth/google.controller');
const naverController = require('./oauth/naver.controller');

/**
 * /api/login/google
 * /api/login/naver
 */

loginController.use('/google', googleController);
loginController.use('/naver', naverController);

loginController.post('/user', async (req, res) => {
  const { email, nickname, profile } = req.body;

  try {
    const existUser = await findUserEmailBoolean({ email });
    if (existUser) {
      throw new Error('이미 등록된 계정입니다. 로그인을 진행해주세요.');
    }

    const result = await createUser({ email, nickname, profile });
    req.session.loginState = true;
    req.session.user = { email };

    return res.json({
      result: true,
      message: '계정 등록이 완료되었습니다.',
    });
  } catch (e) {
    console.error(e.message);
    return res.json({
      result: false,
      message: e.message,
    });
  }
});

const generateNickname = (nickname) => {
  const randomId = Math.random().toString(10).split('.')[1].slice(0, 3);
  return `${nickname}${randomId}`;
};

loginController.post('/check-name', async (req, res) => {
  const { nickname } = req.body;

  try {
    const existNickname = await findUserNicknameBoolean({ nickname });

    if (existNickname) {
      return res.json({
        result: true,
        nickname: generateNickname(nickname),
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

loginController.get('/logout', (req, res) => {
  if (req.session.loginState) {
    req.session.destroy((err) => {
      if (err) {
        return res.json({ result: false, message: '로그아웃 실패' });
      }
      return res
        .clearCookie('cinamahub')
        .json({ result: true, message: '로그아웃 완료' });
    });
  } else {
    return res.json({ result: false, message: '로그인 정보가 없습니다.' });
  }
});

loginController.get('/check-login', (req, res) => {
  if (req.session.loginState) {
    return res.json({ result: true });
  } else {
    return res.json({ result: false });
  }
});

module.exports = loginController;
