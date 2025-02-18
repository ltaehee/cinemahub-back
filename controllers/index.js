const apiController = require("express").Router();
const loginController = require("./login/login.controller");
const searchController = require("./search/search.controller");
/**
 * api/login
 */
apiController.use("/login", loginController);
apiController.use("/search", searchController);
module.exports = apiController;
