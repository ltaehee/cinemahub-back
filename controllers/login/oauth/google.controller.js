const {
  googleClientId,
  googleOauthRedirectUri,
  googleClientSecret,
} = require('../../../consts/firebaseConfig');

const axios = require('axios');
const jwt = require('jsonwebtoken');

const { InvaildRequestError } = require('../../../utils/error');
const { findUserEmailBoolean } = require('../../../services/user/user.service');
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
      const response = requestUserinfo.data;
      const email = response.email;
      const result = await findUserEmailBoolean({ email });

      if (!result) {
        const register_google = jwt.sign(response, 'jwt_secret_key');
        res.cookie('register_google', register_google, {
          httpOnly: true,
          maxAge: 60 * 60 * 1000,
        });
        return res.redirect(`http://localhost:5173/register?social=1`);
      }

      req.session.loginState = true;
      req.session.user = { email };

      // 기등록 유저일 떄 바로 로그인
      return res.redirect('http://localhost:5173/');
    }
  } catch (e) {
    if (e instanceof InvaildRequestError) {
      console.error(e.message);
    }
  }
});

googleController.get('/google-get-data', async (req, res) => {
  const register_google = req.cookies.register_google;

  try {
    const registerData = jwt.verify(register_google, 'jwt_secret_key');

    res.clearCookie('register_google');
    return res.json({
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

// {
//  "id":"110093801430137352077",
//  "email":"pursuit0819@gmail.com",
//  "verified_email":true,
//  "name":"재훈(hun)",
//  "given_name":"재훈",
//  "picture":"https://lh3.googleusercontent.com/a/ACg8ocLs7E0vhaXjXqkHS88uaDZYPVRzUmZm9efoZn3MeHiFuU5VMu8=s96-c"
// }
