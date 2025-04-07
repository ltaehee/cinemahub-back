require('dotenv').config();
const { vaildateEnv } = require('./regex');

const PORT = vaildateEnv('string', process.env.PORT);

const FRONT_URL = vaildateEnv('url', process.env.FRONT_URL);

const MONGODB_URL = vaildateEnv('mongoose', process.env.MONGODB_URL);

const JWT_SECRET_KEY = 'jwt_secret_key';
//vaildateEnv('string', process.env.JWT_SECRET_KEY);

const SESSION_NAME = vaildateEnv('string', process.env.SESSION_NAME);

// const SESSION_SERECT_KEY = 'cinamahub_serect_key';
const SESSION_SERECT_KEY = vaildateEnv(
  'string',
  process.env.SESSION_SERECT_KEY
);

// vaildateEnv(
//   'string',
//   process.env.SESSION_SERECT_KEY
// );

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

module.exports = {
  PORT,
  FRONT_URL,
  MONGODB_URL,
  JWT_SECRET_KEY,
  SESSION_NAME,
  SESSION_SERECT_KEY,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  S3_BUCKET_NAME,
};
