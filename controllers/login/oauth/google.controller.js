const {
  googleClientId,
  googleOauthRedirectUri,
  googleClientSecret,
} = require('../../../consts/firebaseConfig');

const { JWT_SECRET_KEY } = require('../../../consts/app');

const axios = require('axios');

const jwt = require('jsonwebtoken');
const { InvaildRequestError } = require('../../../utils/error');
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
    const register_token = jwt.sign(access_token, 'jwt_secret_key');

    res.cookie('register_token', register_token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });
    return res.redirect(`http://localhost:5173/register?social=1`);
  } catch (e) {
    if (e instanceof InvaildRequestError) {
      console.log(e.message);
    }
  }
});

googleController.get('/google-get-data', async (req, res) => {
  const register_token = req.cookies.register_token;

  try {
    const access_token = jwt.verify(register_token, 'jwt_secret_key');
    const requestUserinfoUrl = `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`;
    const requestUserinfo = await axios.get(requestUserinfoUrl);

    if (requestUserinfo.status === 200) {
      return res.json({
        result: true,
        data: requestUserinfo.data,
      });
    }
  } catch (e) {
    console.log(e.message);
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
