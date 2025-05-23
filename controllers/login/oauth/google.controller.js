const {
  googleClientId,
  googleOauthRedirectUri,
  googleClientSecret,
} = require('../../../consts/firebaseConfig');

const { JWT_SECRET_KEY, FRONT_URL } = require('../../../consts/app');

const axios = require('axios');
const jwt = require('jsonwebtoken');

const { InvaildRequestError } = require('../../../utils/error');
const {
  findUserEmailBoolean,
  findDeletedUserEmailBoolean,
} = require('../../../services/user/user.service');

const googleController = require('express').Router();

/** google oauth
 * /api/login/google-oauth
 */
googleController.get('/google-oauth', (req, res) => {
  const oauthEntryUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${googleOauthRedirectUri}&response_type=code&scope=email profile`;
  res.redirect(oauthEntryUrl);
});

/** google-oauth-redirect
 * /api/login/google-oauth-redirect
 */
googleController.get('/google-oauth-redirect', async (req, res) => {
  const { code } = req.query;

  const redirectUrl = `https://oauth2.googleapis.com/token`;

  try {
    const request = await axios.post(redirectUrl, {
      code,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      redirect_uri: googleOauthRedirectUri,
      grant_type: 'authorization_code',
    });

    const { error, error_description } = request.data;

    if (error && error_description) {
      throw new InvaildRequestError(error, error_description);
    }

    const { access_token } = request.data;

    const requestUserinfoUrl = `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`;
    const requestUserinfo = await axios.get(requestUserinfoUrl);

    if (requestUserinfo.status === 200) {
      const { email, name, picture } = requestUserinfo.data;
      const result = await findUserEmailBoolean({ email });

      // 등록된 회원이 아닐 경우
      if (!result) {
        const register_google = jwt.sign(
          { email, name, picture },
          JWT_SECRET_KEY
        );
        res.cookie('register_google', register_google, {
          httpOnly: true,
          maxAge: 60 * 60 * 1000,
          sameSite: 'None', // 꼭 None
          secure: true, // 반드시 true
        });
        return res.redirect(`${FRONT_URL}register?social=1`);
      }

      // 탈퇴한 회원일 경우 false, 아니면 [{}]
      const IsDeletedUser = await findDeletedUserEmailBoolean({ email });
      if (IsDeletedUser) {
        return res.redirect(`${FRONT_URL}login?user=deleted`);
      }

      req.session.loginState = true;
      req.session.user = { email };
      console.log('req.session.user', req.session.user);

      req.session.save((err) => {
        if (err) {
          console.error('세션 저장 오류:', err);
          return res.status(500).send('세션 저장 실패');
        }
        return res.redirect(FRONT_URL);
      });

      // 기등록 유저일 떄 바로 로그인
      // return res.redirect(FRONT_URL);
    }
  } catch (e) {
    console.error('❌ [3] Google OAuth 토큰 요청 실패!');
    if (e.response) {
      console.error('📦 에러 응답 데이터:', e.response.data);
      console.error('🌐 상태코드:', e.response.status);
    } else {
      console.error('💥 기타 에러:', e.message);
    }

    return res.status(500).send('Google 로그인 중 오류 발생');
  }
});

googleController.get('/google-get-data', async (req, res) => {
  const register_google = req.cookies.register_google;

  try {
    const registerData = jwt.verify(register_google, JWT_SECRET_KEY);

    return res.clearCookie('register_google').json({
      result: true,
      data: registerData,
    });
  } catch (e) {
    return res.json({
      result: false,
      message: '구글 로그인에 실패했습니다. 다시 시도해주세요.',
    });
  }
});

module.exports = googleController;
