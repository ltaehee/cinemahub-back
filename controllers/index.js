const apiController = require('express').Router();
const loginController = require('./login.controller');

/**
 * api/login
 */
apiController.use('/login', loginController);
module.exports = apiController;
