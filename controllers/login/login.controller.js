const loginController = require('express').Router();

const googleController = require('./oauth/google.controller');
// const naverController = require('./oauth/naver.controller');

/**
 * /api/login/google
 * /api/login/naver
 */

loginController.use('/google', googleController);
// loginController.use('/naver', naverController);

module.exports = loginController;
