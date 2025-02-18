require('dotenv').config();

const urlRegex =
  /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\:[0-9]+)?(\/[\w\-./?%&=]*)?$/;
const stringRegex = /^[a-zA-Z]+$/;
const numberRegex = /^\d+$/;

// case const 재선언 불가
const vaildateEnv = (type, targetEnv, value) => {
  if (targetEnv) {
    switch (type) {
      case type === 'string':
        if (stringRegex.test(targetEnv)) {
          return targetEnv;
        } else {
          return value;
        }
      case type === 'number':
        if (numberRegex.test(targetEnv)) {
          return targetEnv;
        } else {
          return value;
        }
      case type === 'url':
        if (urlRegex.test(targetEnv)) {
          return targetEnv;
        } else {
          return value;
        }
      default:
        return value;
    }
  } else {
    return value;
  }
};

const PORT = vaildateEnv(stringRegex, process.env.PORT, '8080');

const FRONT_URL = vaildateEnv(
  urlRegex,
  process.env.FRONT_URL,
  'http://localhost:5173/'
);

const MONGODB_URL = vaildateEnv(
  urlRegex,
  process.env.MONGODB_URL,
  'mongodb+srv://admin:AkZT4Zzy2df3wnM5@cluster0.vxw73.mongodb.net/elice_cinemahub'
);

const JWT_SECRET_KEY = vaildateEnv(
  urlRegex,
  process.env.JWT_SECRET_KEY,
  'jwt_secret_key'
);

const SESSION_NAME = vaildateEnv(
  stringRegex,
  process.env.SESSION_NAME,
  'cinamahub'
);

const SESSION_SERECT_KEY = vaildateEnv(
  stringRegex,
  process.env.SESSION_SERECT_KEY,
  'cinamahub serect key'
);

module.exports = {
  PORT,
  FRONT_URL,
  MONGODB_URL,
  JWT_SECRET_KEY,
  SESSION_NAME,
  SESSION_SERECT_KEY,
};
