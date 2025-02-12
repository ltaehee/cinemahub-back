const {
  naverClientId,
  naverClientSecret,
  naverOauthRedirectUri,
  naverState,
} = require('../../../consts/firebaseConfig');

const { JWT_SECRET_KEY } = require('../../../consts/app');

const axios = require('axios');

const jwt = require('jsonwebtoken');
const { InvaildRequestError } = require('../../../utils/error');
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
    const register_token = jwt.sign(access_token, 'jwt_secret_key');

    res.cookie('register_token', register_token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });
    return res.redirect(`http://localhost:5173/register?social=2`);
  } catch (e) {
    if (e instanceof InvaildRequestError) {
      console.error(e.message);
    }
  }
});

naverController.get('/naver-get-data', async (req, res) => {
  const register_token = req.cookies.register_token;
  const requestUserinfoUrl = `https://openapi.naver.com/v1/nid/me`;

  try {
    const access_token = jwt.verify(register_token, 'jwt_secret_key');
    const requestUserinfo = await axios.get(requestUserinfoUrl, {
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });

    // 작업 중
    if (requestUserinfo.status === 200) {
      return res.json({
        result: true,
        data: requestUserinfo.data.response,
      });
    }
  } catch (e) {
    return res.json({
      result: false,
      message: '네이버 로그인에 실패했습니다. 다시 시도해주세요.',
    });
  }
});

// data: {
//     resultcode: '00',
//     message: 'success',
//     response: {
//       id: 'o4QhabDBnteuiG_affh4FM9chKWvB95vbT3jQ_Cbg2s',
//       nickname: 'GIFT',
//       profile_image: 'https://ssl.pstatic.net/static/pwe/address/img_profile.png',
//       email: 'pursuit0819@naver.com',
//       name: '마재훈'
//     }
//  }

https: module.exports = naverController;
