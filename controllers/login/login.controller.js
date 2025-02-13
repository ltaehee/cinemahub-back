const loginController = require('express').Router();

const {
  createUser,
  findUserEmailBoolean,
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

    if (req.session.number === undefined) {
      req.session.number = 1;
      req.session.loginState = true;
    } else {
      req.session.number++;
      req.session.loginState = true;
    }

    const result = await createUser({ email, nickname, profile });

    return res.json({
      result: true,
      data: result,
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
      } else {
        return res.json({ result: true, message: '로그아웃 완료' });
      }
    });
  } else {
    return res.json({ result: false, message: '로그인 정보가 없습니다.' });
  }
});

// Session {
//   cookie: { path: '/', _expires: null, originalMaxAge: null, httpOnly: true },
//   number: 1
// }

loginController.get('/check-login', (req, res) => {
  console.log(req.session.loginState);
  if (req.session.loginState) {
    return res.json({ result: true });
  } else {
    return res.json({ result: false });
  }
});

// pursuit0819@gmail.com
// 재훈(hun)
// https://lh3.googleusercontent.com/a/ACg8ocLs7E0vhaXjXqkHS88uaDZYPVRzUmZm9efoZn3MeHiFuU5VMu8=s96-c

module.exports = loginController;
