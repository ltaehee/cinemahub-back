const {
  googleClientId,
  googleOauthRedirectUri,
  googleClientSecret,
} = require('../../../consts/firebaseConfig');
const axios = require('axios');

const jwt = require('jsonwebtoken');
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
  const requestToken = await axios.post(redirectUrl, {
    code,
    client_id: googleClientId,
    client_secret: googleClientSecret,
    redirect_uri: googleOauthRedirectUri,
    grant_type: 'authorization_code',
  });

  const { access_token } = requestToken.data;
  const accessToken = jwt.sign(access_token, 'secret Key');

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
  });

  return res.redirect(`http://localhost:5173/register?social=1`);
});

googleController.get('/google-get-data', async (req, res) => {
  const encodedToken = req.cookies.access_token;

  const access_token = jwt.verify(encodedToken, 'secret Key');

  const requestUserinfoUrl = `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`;
  const requestUserinfo = await axios.get(requestUserinfoUrl);

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

module.exports = googleController;

// {
//  "id":"110093801430137352077",
//  "email":"pursuit0819@gmail.com",
//  "verified_email":true,
//  "name":"재훈(hun)",
//  "given_name":"재훈",
//  "picture":"https://lh3.googleusercontent.com/a/ACg8ocLs7E0vhaXjXqkHS88uaDZYPVRzUmZm9efoZn3MeHiFuU5VMu8=s96-c"
// }
