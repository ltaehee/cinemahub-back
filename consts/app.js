const { vaildateEnv } = require('./regex');
require('dotenv').config();

const PORT = vaildateEnv('string', process.env.PORT, '8080');

const FRONT_URL = vaildateEnv(
  'url',
  process.env.FRONT_URL,
  'http://localhost:5173/'
);

const MONGODB_URL = vaildateEnv(
  'mongoose',
  process.env.MONGODB_URL,
  'mongodb+srv://admin:AkZT4Zzy2df3wnM5@cluster0.vxw73.mongodb.net/elice_cinemahub'
);

const JWT_SECRET_KEY = vaildateEnv(
  'string',
  process.env.JWT_SECRET_KEY,
  'jwt_secret_key'
);

const SESSION_NAME = vaildateEnv(
  'string',
  process.env.SESSION_NAME,
  'cinama_hub'
);

const SESSION_SERECT_KEY = vaildateEnv(
  'string',
  process.env.SESSION_SERECT_KEY,
  'cinamahub_serect_key'
);

module.exports = {
  PORT,
  FRONT_URL,
  MONGODB_URL,
  JWT_SECRET_KEY,
  SESSION_NAME,
  SESSION_SERECT_KEY,
};
