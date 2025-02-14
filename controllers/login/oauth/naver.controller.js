const {
  naverClientId,
  naverClientSecret,
  naverOauthRedirectUri,
  naverState,
} = require('../../../consts/firebaseConfig');

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
      const response = requestUserinfo.data.response;
      const email = response.email;
      const result = await findUserEmailBoolean({ email });

      if (!result) {
        const register_naver = jwt.sign(response, 'jwt_secret_key');
        res.cookie('register_naver', register_naver, {
          httpOnly: true,
          maxAge: 60 * 60 * 1000,
        });
        return res.redirect(`http://localhost:5173/register?social=2`);
      }

      req.session.loginState = true;

      // 기등록 유저일 떄 바로 로그인
      return res.redirect(`http://localhost:5173/`);
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
    const registerData = jwt.verify(register_naver, 'jwt_secret_key');
    res.clearCookie('register_naver');
    return res.json({
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
