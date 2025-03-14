require('dotenv').config();
const { vaildateEnv } = require('./regex');

const googleApiKey = vaildateEnv('string', process.env.GOOGLE_API_KEY);

const googleClientId = vaildateEnv('string', process.env.GOOGLE_CLIENT_ID);

const googleClientSecret = vaildateEnv(
  'string',
  process.env.GOOGLE_CLIENT_SECRET
);

const googleOauthRedirectUri = vaildateEnv(
  'url',
  process.env.GOOGLE_OAUTH_REDIRECT_URI
);

const naverClientId = vaildateEnv('string', process.env.NAVER_CLIENT_ID);

const naverClientSecret = vaildateEnv(
  'string',
  process.env.NAVER_CLIENT_SECRET
);

const naverOauthRedirectUri = vaildateEnv(
  'url',
  process.env.NAVER_OAUTH_REDIRECT_URI
);

const naverState = vaildateEnv('string', process.env.NAVER_STATE);

module.exports = {
  googleApiKey,
  googleClientId,
  googleClientSecret,
  googleOauthRedirectUri,
  naverClientId,
  naverClientSecret,
  naverOauthRedirectUri,
  naverState,
};
