const { exit } = require('node:process');

const urlRegex =
  /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\:[0-9]+)?(\/[\w\-./?%&=]*)?$/;
const stringRegex = /^[a-zA-Z0-9._-]+$/;
const numberRegex = /^\d+$/;
const mongooseRegex =
  /^mongodb\+srv:\/\/([a-zA-Z0-9_-]+(:[a-zA-Z0-9_-]+)?@)?([a-zA-Z0-9.-]+)(\/[a-zA-Z0-9_-]+)?(\?[a-zA-Z0-9_=&-]+)?$/;

// case const 재선언 불가
const vaildateEnv = (type, targetEnv) => {
  if (targetEnv) {
    switch (type) {
      case type === 'string':
        if (stringRegex.test(targetEnv)) {
          return targetEnv;
        } else {
          return process.exit(1);
        }
      case type === 'number':
        if (numberRegex.test(targetEnv)) {
          return targetEnv;
        } else {
          return process.exit(1);
        }
      case type === 'url':
        if (urlRegex.test(targetEnv)) {
          return targetEnv;
        } else {
          return process.exit(1);
        }
      case type === 'mongoose':
        if (mongooseRegex.test(targetEnv)) {
          return targetEnv;
        } else {
          return process.exit(1);
        }
      default:
        return;
    }
  } else {
    return process.exit(1);
  }
};

module.exports = {
  vaildateEnv,
};
