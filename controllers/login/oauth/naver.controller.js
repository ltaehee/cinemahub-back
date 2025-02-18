const {
  naverClientId,
  naverClientSecret,
  naverOauthRedirectUri,
  naverState,
} = require('../../../consts/firebaseConfig');

const { JWT_SECRET_KEY, FRONT_URL } = require('../../../consts/app');

const axios = require('axios');
const jwt = require('jsonwebtoken');

const { InvaildRequestError } = require('../../../utils/error');
const { findUserEmailBoolean } = require('../../../services/user/user.service');
const naverController = require('express').Router();

/** naver oauth
 * /api/login/naver/naver-oauth
 */
naverController.get('/naver-oauth', (req, res) => {
  const oauthEntryUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${naverOauthRedirectUri}&state=${naverState}`;
  res.redirect(oauthEntryUrl);
});

/** naver redirect
 * /api/login/naver/callback
 */
naverController.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const redirectUrl = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${naverClientId}&client_secret=${naverClientSecret}&code=${code}&state=${state}`;

  try {
    //post로 했을 때 에러가 나서 get으로 변경
    const request = await axios.get(redirectUrl);
    const { error, error_description } = request.data;

    if (error && error_description) {
      throw new InvaildRequestError(error, error_description);
    }

    const { access_token } = request.data;

    const requestUserinfoUrl = `https://openapi.naver.com/v1/nid/me`;
    const requestUserinfo = await axios.get(requestUserinfoUrl, {
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (requestUserinfo.status === 200) {
      const { email, nickname, profile_image } = requestUserinfo.data.response;
      const result = await findUserEmailBoolean({ email });

      if (!result) {
        const register_naver = jwt.sign(
          { email, nickname, profile_image },
          JWT_SECRET_KEY
        );
        res.cookie('register_naver', register_naver, {
          httpOnly: true,
          maxAge: 60 * 60 * 1000,
        });
        return res.redirect(`${FRONT_URL}register?social=2`);
      }

      req.session.loginState = true;
      req.session.user = { email };

      // 기등록 유저일 떄 바로 로그인
      return res.redirect(`${FRONT_URL}`);
    }
  } catch (e) {
    if (e instanceof InvaildRequestError) {
      console.error(e.message);
    }
  }
});

naverController.get('/naver-get-data', async (req, res) => {
  const register_naver = req.cookies.register_naver;

  try {
    const registerData = jwt.verify(register_naver, JWT_SECRET_KEY);
    return res.clearCookie('register_naver').json({
      result: true,
      data: registerData,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: '네이버 로그인에 실패했습니다. 다시 시도해주세요.',
    });
  }
});

https: module.exports = naverController;
