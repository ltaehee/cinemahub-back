const {
  naverClientId,
  naverClientSecret,
  naverOauthRedirectUri,
  naverState,
} = require('../../../consts/firebaseConfig');

const axios = require('axios');

const jwt = require('jsonwebtoken');
const naverController = require('express').Router();

/** naver oauth
 * /api/login/naver/naver-oauth
 */
naverController.get('/naver-oauth', (req, res) => {
  const oauthEntryUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${naverOauthRedirectUri}&state=${encodeURIComponent(
    naverState
  )}`;
  res.redirect(oauthEntryUrl);
});

/** naver redirect
 * /api/login/naver/callback
 */
naverController.get('/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error && error_description) {
    throw new Error(error_description);
  }

  const redirectUrl = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${naverClientId}&client_secret=${naverClientSecret}&code=${code}&state=${state}`;

  try {
    const request = await axios.get(redirectUrl);
    const { error, error_description } = request.data;

    if (error && error_description) {
      throw new Error(error_description);
    }

    const { access_token } = request.data;
    const register_token = jwt.sign(access_token, 'secret Key');

    res.cookie('register_token', register_token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });
    return res.redirect(`http://localhost:5173/register?social=2`);
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
  }
});

naverController.get('/naver-get-data', async (req, res) => {
  const register_token = req.cookies.register_token;
  const access_token = jwt.verify(register_token, 'secret Key');

  const requestUserinfoUrl = `https://openapi.naver.com/v1/nid/me`;
  const requestUserinfo = await axios.get(requestUserinfoUrl, {
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (requestUserinfo.status === 200) {
    return res.json({
      result: true,
      data: requestUserinfo.data,
    });
  }

  return res.json({
    result: false,
    message: '구글 로그인에 실패했습니다. 다시 시도해주세요.',
  });
});

https: module.exports = naverController;
