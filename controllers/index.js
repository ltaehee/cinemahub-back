const apiController = require("express").Router();
const loginController = require("./login/login.controller");
const movieController = require("./movie.controller");

/**
 * api/login
 */
apiController.use("/login", loginController);
apiController.use("/movie", movieController);

module.exports = apiController;
