require('dotenv').config();
const { vaildateEnv } = require('./regex');

const PORT = vaildateEnv('string', process.env.PORT);

const FRONT_URL = vaildateEnv('url', process.env.FRONT_URL);

const MONGODB_URL = vaildateEnv('mongoose', process.env.MONGODB_URL);

const JWT_SECRET_KEY = 'jwt_secret_key';
//vaildateEnv('string', process.env.JWT_SECRET_KEY);

const SESSION_NAME = vaildateEnv('string', process.env.SESSION_NAME);

const SESSION_SERECT_KEY = 'cinamahub_serect_key';
// vaildateEnv(
//   'string',
//   process.env.SESSION_SERECT_KEY
// );

module.exports = {
  PORT,
  FRONT_URL,
  MONGODB_URL,
  JWT_SECRET_KEY,
  SESSION_NAME,
  SESSION_SERECT_KEY,
};
