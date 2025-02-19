const apiController = require("express").Router();
const loginController = require("./login/login.controller");
const movieController = require("./movie.controller");
const searchController = require("./search/search.controller");
const profileController = require("./profile/profile.controller");
/**
 * api/login
 */
apiController.use("/login", loginController);
apiController.use("/movie", movieController);
apiController.use("/search", searchController);
apiController.use("/profile", profileController);

module.exports = apiController;
