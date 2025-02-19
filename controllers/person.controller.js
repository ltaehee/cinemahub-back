const {
  getPopularActors,
} = require("../services/person/fetchPopularActors.service");

const personController = require("express").Router();

personController.get("/popular", async (req, res) => {
  const actors = await getPopularActors();
  res.json(actors);
});

module.exports = personController;
